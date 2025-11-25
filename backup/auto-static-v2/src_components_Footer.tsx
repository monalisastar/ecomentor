'use client'

import Link from "next/link";;
import { Facebook, Twitter, Linkedin } from "lucide-react";;

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 px-6 md:px-12 border-t border-white/10">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">

        {/* Left: Brand + Copyright */}
        <div>
          <h3 className="text-2xl font-bold mb-3">Eco-Mentor</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Empowering Action Through Climate Knowledge.
          </p>
          <p className="text-xs text-gray-600 mt-6">
            &copy; {new Date().getFullYear()} Eco-Mentor. All rights reserved.
          </p>
        </div>

        {/* Center: Quick Links */}
        <div>
          <h4 className="font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            {['Home', 'About', 'Courses', 'Contact'].map((label) => (
              <li key={label}>
                <Link
                  href={`/${label.toLowerCase()}`}
                  className="hover:text-green-400 transition"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Socials */}
        <div>
          <h4 className="font-semibold text-white mb-3">Follow Us</h4>
          <div className="flex gap-4 text-gray-400">
            <Facebook className="hover:text-green-400 cursor-pointer" size={20} />
            <Twitter className="hover:text-green-400 cursor-pointer" size={20} />
            <Linkedin className="hover:text-green-400 cursor-pointer" size={20} />
          </div>
        </div>
      </div>
    </footer>
  )
}

