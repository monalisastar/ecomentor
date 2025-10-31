import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import slugify from "slugify";
import { parsePptx } from "pptx-parser";
import mammoth from "mammoth";
import * as pdf from "pdf-parse";
import unzipper from "unzipper";

// ✅ Define minimal compatible types manually (safe for any Formidable version)
type FormidableFields = Record<string, any>;
type FormidableFiles = Record<string, any>;

// ⚙️ Disable Next.js body parsing for file uploads
export const config = {
  api: { bodyParser: false },
};

/**
 * 📚 Auto Import Course Content
 * -------------------------------------------------
 * Accepts a .pptx, .pdf, .docx, or .zip file
 * Parses content and auto-generates modules + lessons
 * for a given course (by slug)
 */
export async function POST(
  req: Request,
  { params }: { params: { courseSlug: string } }
) {
  try {
    const form = formidable({ multiples: false, keepExtensions: true });

    // ✅ Use custom types instead of Formidable namespace types
    const data = await new Promise<{ fields: FormidableFields; files: FormidableFiles }>(
      (resolve, reject) => {
        form.parse(
          req as any,
          (err: Error | null, fields: FormidableFields, files: FormidableFiles) => {
            if (err) reject(err);
            else resolve({ fields, files });
          }
        );
      }
    );

    // 🗂️ Extract file
    const file = (data.files as any).file?.[0] || (data.files as any).file;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const ext = path.extname(file.originalFilename || "").toLowerCase();
    const buffer = await fs.readFile(file.filepath);

    let contentBlocks: { title: string; text: string }[] = [];

    // 🧠 Detect file type and parse accordingly
    if (ext === ".pptx") {
      const slides = await parsePptx(file.filepath);
      contentBlocks = slides.map((s: any, i: number) => ({
        title: s.text[0]?.text || `Slide ${i + 1}`,
        text: s.text.map((t: any) => t.text).join("\n"),
      }));
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer });
      const paragraphs = result.value
        .split("\n\n")
        .filter((p: string) => p.trim());
      contentBlocks = paragraphs.map((p: string, i: number) => ({
        title: `Section ${i + 1}`,
        text: p,
      }));
    } else if (ext === ".pdf") {
      const data = await pdf.default(buffer);
      const pages = data.text.split("\n\n").filter((p: string) => p.trim());
      contentBlocks = pages.map((p: string, i: number) => ({
        title: `Page ${i + 1}`,
        text: p,
      }));
    } else if (ext === ".zip") {
      const directory = await unzipper.Open.buffer(buffer);
      for (const fileEntry of directory.files) {
        if (fileEntry.path.endsWith(".txt")) {
          const content = await fileEntry.buffer();
          contentBlocks.push({
            title: path.basename(fileEntry.path),
            text: content.toString(),
          });
        }
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Use .pptx, .pdf, .docx, or .zip" },
        { status: 400 }
      );
    }

    // 🪄 Split into modules & lessons
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
        });
      } else {
        const lastLesson = currentModule?.lessons.at(-1);
        if (lastLesson) lastLesson.content += "\n" + block.text;
      }
    }

    if (currentModule) modules.push(currentModule);

    const course = await prisma.course.findUnique({
      where: { slug: params.courseSlug },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    for (const module of modules) {
      const createdModule = await prisma.module.create({
        data: {
          title: module.title,
          slug: module.slug,
          courseId: course.id,
        },
      });

      for (const lesson of module.lessons) {
        await prisma.lesson.create({
          data: {
            title: lesson.title,
            slug: lesson.slug,
            content: lesson.content,
            moduleId: createdModule.id,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${modules.length} module(s) successfully.`,
    });
  } catch (error: any) {
    console.error("❌ Import Error:", error);
    return NextResponse.json(
      { error: "Import failed", details: error.message },
      { status: 500 }
    );
  }
}
