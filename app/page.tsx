import Terminal from './components/Terminal'
import Dock from './components/Dock'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-200 to-pink-100">
      <Terminal />
      <Dock />
    </main>
  )
} 