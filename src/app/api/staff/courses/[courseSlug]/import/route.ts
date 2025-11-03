import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import path from "path"
import slugify from "slugify"
import fs from "fs"
import JSZip from "jszip"
import unzipper from "unzipper"
import mammoth from "mammoth"
import sharp from "sharp"
import { supabase } from "@/lib/supabase"

/**
 * 🧩 Fallback PPTX parser using JSZip (handles XML + media uploads)
 */
async function extractSlidesFromPptx(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer)
  const entries = Object.keys(zip.files)

  const slideEntries = entries.filter((e) => e.startsWith("ppt/slides/slide"))
  const imageEntries = entries.filter((e) => e.startsWith("ppt/media/"))
  const imageMap: Record<string, string> = {}

  for (const name of imageEntries) {
    const imgFile = zip.files[name]
    if (!imgFile) continue

    try {
      const inputBuffer = await imgFile.async("nodebuffer")
      if (!inputBuffer?.length) continue

      const compressed = await sharp(inputBuffer)
        .resize({ width: 1280, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()

      const fileName = `${path.basename(name, path.extname(name))}.webp`
      await supabase.storage
        .from("eco-mentor-assets")
        .upload(`course-import/${fileName}`, compressed, {
          contentType: "image/webp",
          cacheControl: "3600",
          upsert: true,
        })

      const { data: urlData } = supabase.storage
        .from("eco-mentor-assets")
        .getPublicUrl(`course-import/${fileName}`)

      imageMap[path.basename(name)] = urlData.publicUrl
    } catch (err) {
      console.error("⚠️ Image upload error:", err)
    }
  }

  const slides: any[] = []
  for (const [i, name] of slideEntries.entries()) {
    const slideFile = zip.files[name]
    if (!slideFile) continue

    const xml = await slideFile.async("string")
    const texts = [...xml.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g)].map((m) => m[1])
    const joined = texts.join("\n").trim()

    const relFileKey = entries.find((e) => e.includes(`_rels/${path.basename(name)}.rels`))
    let relXml = ""
    if (relFileKey) relXml = await zip.files[relFileKey].async("string")

    const mediaMatches = [...relXml.matchAll(/media\/([A-Za-z0-9._-]+)/g)]
    const images = mediaMatches.map((m) => imageMap[m[1]]).filter(Boolean)

    if (joined || images.length) {
      slides.push({
        title: texts[0] || `Slide ${i + 1}`,
        texts,
        images,
        thumbnail: images[0] || null,
      })
    }
  }

  return slides
}

export const runtime = "nodejs"

/**
 * 📚 Auto Import Course Content — Supabase + JSZip + Preview Support
 */
export async function POST(req: Request, { params }: { params: { courseSlug: string } }) {
  try {
    console.log("🚀 Course import started for:", params.courseSlug)
    const start = Date.now()

    let file: File | null = null
    let isPreview = false
    let bucket: string | null = null
    let filePath: string | null = null

    // 🧠 Determine request type (JSON vs FormData)
    if (req.headers.get("content-type")?.includes("application/json")) {
      const body = await req.json()
      bucket = body.bucket
      filePath = body.filePath
      isPreview = body.preview === true

      if (!bucket || !filePath)
        return NextResponse.json({ error: "Missing bucket or file path" }, { status: 400 })

      const { data, error } = await supabase.storage.from(bucket).download(filePath)
      if (error || !data)
        return NextResponse.json({ error: "Failed to download file from Supabase" }, { status: 400 })

      const arrayBuffer = await data.arrayBuffer()
      file = new File([arrayBuffer], path.basename(filePath))
    } else {
      const formData = await req.formData()
      file = formData.get("file") as File | null
      isPreview = formData.get("preview") === "true"
    }

    if (!file) return NextResponse.json({ error: "No file received" }, { status: 400 })

    console.log(`📦 Processing file: ${file.name}`)
    const ext = path.extname(file.name).toLowerCase()
    const buffer = Buffer.from(await file.arrayBuffer())

    let contentBlocks: { title: string; text: string; images?: string[] }[] = []

    // 🧠 PPTX PARSER
    if (ext === ".pptx") {
      console.log("🧩 Parsing PPTX file...")
      let slides: any[] = []

      try {
        const pptxModule = await import("pptx2json")
        const PPTX2Json = (pptxModule as any).default || pptxModule
        const parser = new (PPTX2Json as any)()

        const tmpPath = path.join("/tmp", `${Date.now()}-${Math.random()}.pptx`)
        await fs.promises.writeFile(tmpPath, buffer)
        const result = await parser.toJson(tmpPath)
        slides = Array.isArray(result)
          ? result
          : Array.isArray(result?.slides)
          ? result.slides
          : []
        await fs.promises.unlink(tmpPath)
      } catch (err) {
        console.warn("⚠️ pptx2json failed, falling back to JSZip XML parser:", err)
        slides = await extractSlidesFromPptx(buffer)
      }

      console.log(`📊 Extracted ${slides.length} slide(s)`)
      contentBlocks = slides.map((slide, i) => {
        const text = (slide.texts || []).join("\n")
        const htmlImages =
          slide.images?.map((url: string) => `<img src="${url}" alt="Slide image"/>`).join("<br/>") ||
          ""
        return {
          title: slide.title || `Slide ${i + 1}`,
          text: `${text}<br/>${htmlImages}`,
          images: slide.images || [],
        }
      })
    }

    // 🧾 DOCX PARSER
    else if (ext === ".docx") {
      console.log("🧾 Extracting DOCX content...")
      const result = await mammoth.convertToHtml({ buffer })
      const sections = result.value
        .split(/<h\d>|<\/h\d>/)
        .map((s: string) => s.trim())
        .filter(Boolean)
      contentBlocks = sections.map((html, i) => ({
        title: `Section ${i + 1}`,
        text: html,
      }))
    }

    // 📄 PDF PARSER
    else if (ext === ".pdf") {
      console.log("📄 Parsing PDF...")
      const pdfModule = await import("pdf-parse")
      const pdf = (pdfModule as any).default || pdfModule
      const data = await pdf(buffer)
      const pages = data.text.split(/\n\s*\n/).filter((p: string) => p.trim())
      contentBlocks = pages.map((p: string, i: number) => ({
        title: `Page ${i + 1}`,
        text: `<p>${p.replace(/\n/g, "<br/>")}</p>`,
      }))
    }

    // 📦 ZIP PARSER
    else if (ext === ".zip") {
      console.log("📦 Extracting .zip archive...")
      const directory = await unzipper.Open.buffer(buffer)
      for (const fileEntry of directory.files) {
        if (fileEntry.path.endsWith(".txt")) {
          const content = await fileEntry.buffer()
          contentBlocks.push({
            title: path.basename(fileEntry.path),
            text: `<p>${content.toString()}</p>`,
          })
        }
      }
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    // 🧱 STRUCTURE MODULES & LESSONS
    console.log("🧱 Structuring modules and lessons...")
    const modules: any[] = []
    let currentModule: any = null

    for (const block of contentBlocks) {
      const title = block.title.toLowerCase()
      if (title.includes("module")) {
        if (currentModule) modules.push(currentModule)
        currentModule = {
          title: block.title,
          slug: slugify(block.title, { lower: true }),
          lessons: [],
        }
      } else if (title.includes("lesson")) {
        currentModule?.lessons.push({
          title: block.title,
          slug: slugify(block.title, { lower: true }),
          textContent: block.text,
          images: block.images || [],
        })
      } else {
        const lastLesson = currentModule?.lessons.at(-1)
        if (lastLesson) {
          lastLesson.textContent += `<br/>${block.text}`
          if (block.images?.length)
            lastLesson.images = [...(lastLesson.images || []), ...block.images]
        }
      }
    }
    if (currentModule) modules.push(currentModule)
    console.log(`📚 Organized into ${modules.length} module(s)`)

    // 👀 PREVIEW MODE
    if (isPreview) {
      console.log("👀 Preview mode active — skipping DB write")
      return NextResponse.json({
        success: true,
        preview: modules,
        message: `Parsed ${modules.length} module(s) for preview.`,
      })
    }

    // 💾 DATABASE SAVE
    console.log("💾 Writing to database...")
    const course = await prisma.course.findUnique({ where: { slug: params.courseSlug } })
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

    let savedModules = 0
    let savedLessons = 0

    for (const module of modules) {
      const baseModuleSlug = slugify(module.title, { lower: true })
      let uniqueModuleSlug = baseModuleSlug
      let modCounter = 1

      while (await prisma.module.findUnique({ where: { slug: uniqueModuleSlug } })) {
        uniqueModuleSlug = `${baseModuleSlug}-${modCounter++}`
      }

      const createdModule = await prisma.module.create({
        data: { title: module.title, slug: uniqueModuleSlug, courseId: course.id },
      })
      savedModules++

      for (const lesson of module.lessons) {
        const baseLessonSlug = slugify(lesson.title || "lesson", { lower: true })
        let uniqueLessonSlug = baseLessonSlug
        let counter = 1

        while (await prisma.lesson.findUnique({ where: { slug: uniqueLessonSlug } })) {
          uniqueLessonSlug = `${baseLessonSlug}-${counter++}`
        }

        await prisma.lesson.create({
          data: {
            title: lesson.title,
            slug: uniqueLessonSlug,
            textContent: lesson.textContent, // ✅ corrected field
            moduleId: createdModule.id,
          },
        })
        savedLessons++
      }
    }

    const duration = ((Date.now() - start) / 1000).toFixed(1)
    console.log(
      `✅ Import completed in ${duration}s — ${savedModules} module(s), ${savedLessons} lesson(s).`
    )

    return NextResponse.json({
      success: true,
      message: `Imported ${savedModules} module(s) and ${savedLessons} lesson(s) successfully.`,
    })
  } catch (error: any) {
    console.error("❌ Import Error:", error)
    return NextResponse.json({ error: "Import failed", details: error.message }, { status: 500 })
  }
}
