"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Share2, ZoomIn, ArrowRight } from "lucide-react"
import Link from "next/link"

export type Certificate = {
  id: number
  title: string
  image: string
}

type Props = {
  certificates: Certificate[]
}

export default function CertificatesShowcase({ certificates }: Props) {
  const [selected, setSelected] = useState<Certificate | null>(null)

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Certificates</span>
          <span className="text-sm text-muted-foreground">{certificates.length} earned</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {certificates.slice(0, 4).map((cert) => ( // show only first 4 in widget
            <div
              key={cert.id}
              className="relative w-full h-32 rounded-lg overflow-hidden shadow-md group cursor-pointer"
              onClick={() => setSelected(cert)}
            >
              <Image
                src={cert.image}
                alt={cert.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition flex items-end p-2">
                <p className="text-white text-xs font-medium">{cert.title}</p>
              </div>
              <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                <ZoomIn size={16} className="text-emerald-600" />
              </div>
            </div>
          ))}
        </div>

        {/* 🔹 "Show All" CTA */}
        {certificates.length > 4 && (
          <div className="flex justify-center mt-4">
            <Link href="/certificates">
              <Button variant="outline" className="flex items-center gap-2">
                Show All Certificates <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>

      {/* 🔹 Certificate Modal Preview */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
              </DialogHeader>
              <div className="relative w-full h-80 md:h-[500px] rounded-lg overflow-hidden">
                <Image
                  src={selected.image}
                  alt={selected.title}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download size={16} /> Download
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Share2 size={16} /> Share
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
