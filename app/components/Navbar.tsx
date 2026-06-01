import Image from 'next/image';
import Link from 'next/link';

const menuItems = [
  { label: 'Inicio', href: '/#inicio' },
  { label: 'Score de Seguridad', href: '/score' },
  { label: 'Blog', href: '/blog' }
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="RutaSegura AI Logo"
            width={180}
            height={60}
            className="h-14 w-auto"
          />
          <span className="text-lg font-semibold text-slate-800">Ruta Segura AI</span>
        </Link>

        <nav className="flex items-center gap-8 text-sm font-medium text-slate-800">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-blue-700">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
