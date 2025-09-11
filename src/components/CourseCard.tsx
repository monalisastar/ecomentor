'use client'
import Link from 'next/link'
import Image from 'next/image'

type Props = {
  title: string
  slug: string
  description: string
  image: string
}

export default function CourseCard({ title, slug, description, image }: Props) {
  return (
    <Link href={`/start/${slug}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
        <div className="relative w-full h-52 md:h-56">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <h3 className="absolute bottom-2 left-4 text-white text-lg font-semibold">
            {title}
          </h3>
        </div>
        <div className="p-4 h-28">
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  )
}



