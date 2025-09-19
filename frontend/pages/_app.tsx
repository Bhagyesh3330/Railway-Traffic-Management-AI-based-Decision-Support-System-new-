import '../styles/globals.css';
import type { AppProps } from 'next/app';

function Header() {
  return (
    <header className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-white shadow-md">
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">IR</span>
            </div>
          </div>
          <div>
            <div className="text-sm uppercase tracking-wider text-white/90 font-medium">भारतीय रेल</div>
            <div className="text-lg font-bold">INDIAN RAILWAYS</div>
            <div className="text-sm text-white/80">Decision Support System</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-white/90">
          <a className="hover:text-white font-medium transition-colors" href="#dashboard">Dashboard</a>
          <a className="hover:text-white font-medium transition-colors" href="#whatif">What-if</a>
          <a className="hover:text-white font-medium transition-colors" href="#about">About</a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t-2 border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-6 py-6 text-sm text-gray-700 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">IR</span>
          </div>
          <span>© {new Date().getFullYear()} Indian Railways — Decision Support Prototype</span>
        </div>
        <div className="text-gray-500 font-medium">
          For demonstration purposes only. Not an official IR system.
        </div>
      </div>
    </footer>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-100">
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  );
}
