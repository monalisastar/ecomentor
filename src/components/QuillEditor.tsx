"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

let ReactQuill: any = null

export default function QuillEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // dynamically require to ensure patching before load
    ;(async () => {
      if (!ReactQuill) {
        const mod = await import("react-quill")
        ReactQuill = mod.default
      }
      setMounted(true)
    })()
  }, [])

  if (!mounted || !ReactQuill) {
    return <div className="border rounded p-2 text-sm text-muted-foreground">Loading editor...</div>
  }

  return <ReactQuill theme="snow" value={value} onChange={onChange} />
}
