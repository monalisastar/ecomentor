import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";
import slugify from "slugify";
import unzipper from "unzipper";
import mammoth from "mammoth";
import AdmZip from "adm-zip";
import sharp from "sharp";

/**
 * 🧩 Fallback XML extractor for PPTX text + images (with WebP compression)
 */
async function extractSlidesFromPptx(buffer: Buffer) {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();

  const uploadDir = path.join(process.cwd(), "public", "uploads", "pptx");
  await fs.mkdir(uploadDir, { recursive: true });

  const slideEntries = entries.filter((e) => e.entryName.startsWith("ppt/slides/slide"));
  const imageEntries = entries.filter((e) => e.entryName.startsWith("ppt/media/"));

  const imageMap: Record<string, string> = {};
  for (const img of imageEntries) {
    const fileName = path.basename(img.entryName, path.extname(img.entryName)) + ".webp";
    const outputPath = path.join(uploadDir, fileName);

    try {
      const inputBuffer = img.getData();
      await sharp(inputBuffer)
        .resize({ width: 1280, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);
    } catch {
      await fs.writeFile(outputPath, img.getData());
    }

    imageMap[path.basename(img.entryName)] = `/uploads/pptx/${fileName}`;
  }

  const slides: any[] = [];
  for (const [i, slideEntry] of slideEntries.entries()) {
    const xml = slideEntry.getData().toString("utf8");
    const texts = [...xml.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g)].map((m) => m[1]);
    const joined = texts.join("\n").trim();

    const images = [...xml.matchAll(/r:embed="rId\d+"/g)]
      .map((m) => m[0])
      .map((rId) => {
        const relFile = entries.find(
          (e) =>
            e.entryName.includes(`_rels/${path.basename(slideEntry.entryName)}.rels`) &&
            e.getData().toString("utf8").includes(rId)
        );
        if (!relFile) return null;
        const relXml = relFile.getData().toString("utf8");
        const mediaMatch = relXml.match(/media\/([A-Za-z0-9._-]+)/);
        return mediaMatch ? imageMap[mediaMatch[1]] : null;
      })
      .filter(Boolean);

    if (joined || images.length)
      slides.push({
        title: texts[0] || `Slide ${i + 1}`,
        texts,
        images,
      });
  }

  return slides;
}

/**
 * 📚 Auto Import Course Content (with safe slugging + progress)
 */
export async function POST(
  req: Request,
  { params }: { params: { courseSlug: string } }
) {
  try {
    console.log("🚀 Import started...");
    const startTime = Date.now();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    console.log(`📦 Received file: ${file.name}`);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = path.extname(file.name).toLowerCase();

    let contentBlocks: { title: string; text: string; images?: string[] }[] = [];

    // 🧠 PPTX parser
    if (ext === ".pptx") {
      console.log("🧩 Parsing PPTX file...");
      const tempFilePath = path.join(process.cwd(), "temp", `${Date.now()}-${file.name}`);
      await fs.mkdir(path.dirname(tempFilePath), { recursive: true });
      await fs.writeFile(tempFilePath, buffer);

      const pptxModule = await import("pptx2json");
      const PPTX2Json = (pptxModule as any).default || pptxModule;
      let slides: any[] = [];

      try {
        const parser = new (PPTX2Json as any)(tempFilePath);
        const result = await parser.toJson(tempFilePath);
        slides = Array.isArray(result)
          ? result
          : Array.isArray(result?.slides)
          ? result.slides
          : [];

        if (!slides.length) {
          console.warn("⚠️ pptx2json returned 0 slides — switching to XML fallback...");
          slides = await extractSlidesFromPptx(buffer);
        }
      } catch (err) {
        console.error("⚠️ PPTX2Json error:", err);
        slides = await extractSlidesFromPptx(buffer);
      }

      console.log(`📊 Found ${slides.length} slide(s).`);
      for (const [i, slide] of slides.entries()) {
        const text = (slide.texts || []).join("\n");
        const htmlImages =
          slide.images?.map((url: string) => `<img src="${url}" alt="Slide image"/>`).join("<br/>") || "";
        contentBlocks.push({
          title: slide.title || `Slide ${i + 1}`,
          text: `${text}<br/>${htmlImages}`,
          images: slide.images || [],
        });
      }

      await fs.unlink(tempFilePath);
      console.log("✅ PPTX parsing + image compression completed.");
    }

    // 🧾 DOCX parser
    else if (ext === ".docx") {
      console.log("🧾 Extracting DOCX content...");
      const result = await mammoth.convertToHtml({ buffer });
      const sections = result.value
        .split(/<h\d>|<\/h\d>/)
        .map((s: string) => s.trim())
        .filter(Boolean);
      contentBlocks = sections.map((html, i) => ({
        title: `Section ${i + 1}`,
        text: html,
      }));
    }

    // 📄 PDF parser
    else if (ext === ".pdf") {
      console.log("📄 Reading PDF text...");
      const pdfModule = await import("pdf-parse");
      const pdf = (pdfModule as any).default || pdfModule;
      const data = await pdf(buffer);
      const pages = data.text.split(/\n\s*\n/).filter((p: string) => p.trim());
      contentBlocks = pages.map((p: string, i: number) => ({
        title: `Page ${i + 1}`,
        text: `<p>${p.replace(/\n/g, "<br/>")}</p>`,
      }));
    }

    // 📦 ZIP parser
    else if (ext === ".zip") {
      console.log("📦 Unzipping .zip file...");
      const directory = await unzipper.Open.buffer(buffer);
      for (const fileEntry of directory.files) {
        if (fileEntry.path.endsWith(".txt")) {
          const content = await fileEntry.buffer();
          contentBlocks.push({
            title: path.basename(fileEntry.path),
            text: `<p>${content.toString()}</p>`,
          });
        }
      }
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    // 🧱 Structure modules & lessons
    console.log("🧱 Structuring modules and lessons...");
    let currentModule: any = null;
    const modules: any[] = [];

    for (const block of contentBlocks) {
      const title = block.title.toLowerCase();
      if (title.includes("module")) {
        if (currentModule) modules.push(currentModule);
        currentModule = {
          title: block.title,
          slug: slugify(block.title, { lower: true }),
          lessons: [],
        };
      } else if (title.includes("lesson")) {
        currentModule?.lessons.push({
          title: block.title,
          slug: slugify(block.title, { lower: true }),
          content: block.text,
          images: block.images || [],
        });
      } else {
        const lastLesson = currentModule?.lessons.at(-1);
        if (lastLesson) {
          lastLesson.content += `<br/>${block.text}`;
          if (block.images?.length)
            lastLesson.images = [...(lastLesson.images || []), ...block.images];
        }
      }
    }
    if (currentModule) modules.push(currentModule);
    console.log(`📚 Organized into ${modules.length} module(s).`);

    // 💾 Save to DB with unique slugs
    console.log("💾 Saving modules and lessons...");
    const course = await prisma.course.findUnique({
      where: { slug: params.courseSlug },
    });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    let savedModules = 0,
      savedLessons = 0;

    for (const module of modules) {
      const baseModuleSlug = slugify(module.title, { lower: true });
      let uniqueModuleSlug = baseModuleSlug;
      let modCounter = 1;

      while (await prisma.module.findUnique({ where: { slug: uniqueModuleSlug } })) {
        uniqueModuleSlug = `${baseModuleSlug}-${modCounter++}`;
      }

      const createdModule = await prisma.module.create({
        data: {
          title: module.title,
          slug: uniqueModuleSlug,
          courseId: course.id,
        },
      });
      savedModules++;
      console.log(`📘 Module saved: ${module.title}`);

      for (const lesson of module.lessons) {
        const baseLessonSlug = slugify(lesson.title || "lesson", { lower: true });
        let uniqueLessonSlug = baseLessonSlug;
        let counter = 1;

        while (await prisma.lesson.findUnique({ where: { slug: uniqueLessonSlug } })) {
          uniqueLessonSlug = `${baseLessonSlug}-${counter++}`;
        }

        await prisma.lesson.create({
          data: {
            title: lesson.title,
            slug: uniqueLessonSlug,
            content: lesson.content,
            moduleId: createdModule.id,
          },
        });
        savedLessons++;
        console.log(`   ➕ Lesson saved: ${lesson.title} (${uniqueLessonSlug})`);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Import completed in ${duration}s: ${savedModules} module(s), ${savedLessons} lesson(s).`);

    return NextResponse.json({
      success: true,
      message: `Imported ${savedModules} module(s) and ${savedLessons} lesson(s) successfully.`,
    });
  } catch (error: any) {
    console.error("❌ Import Error:", error);
    return NextResponse.json(
      { error: "Import failed", details: error.message },
      { status: 500 }
    );
  }
}
