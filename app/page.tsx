import Terminal from '../components/Terminal';
import { Dock } from '../components/Dock';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 to-sky-300">
      <Terminal />
      <Dock />
    </main>
  );
} 