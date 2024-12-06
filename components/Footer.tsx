import { Twitter, ExternalLink, MessageCircle, Shapes, Send } from 'lucide-react'
import Link from 'next/link'

const footerLinks = [
  { name: 'X', url: 'https://x.com', icon: Twitter },
  { name: 'Dexscreener', url: 'https://dexscreener.com', icon: ExternalLink },
  { name: 'Discord', url: 'https://discord.com', icon: MessageCircle },
  { name: 'Opensea', url: 'https://opensea.io', icon: Shapes },
  { name: 'Telegram', url: 'https://telegram.org', icon: Send },
]

export function Footer() {
  return (
    <footer className="w-full max-w-2xl mx-auto mt-8">
      <div className="flex flex-wrap justify-center items-center gap-6 p-4 bg-white/10 backdrop-blur-xl rounded-lg shadow-lg border border-white/20">
        {footerLinks.map((link) => (
          <Link
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-black hover:text-black/70 transition-colors duration-200"
          >
            <link.icon className="w-5 h-5" />
            <span className="text-sm">{link.name}</span>
          </Link>
        ))}
      </div>
    </footer>
  )
}

