"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavLink = {
  href: string;
  label: string;
};

interface HeaderNavigationProps {
  navLinks: NavLink[];
}

export function HeaderNavigation({ navLinks }: HeaderNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-6 text-sm">
      {navLinks.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`transition-colors hover:text-foreground/80 ${
            pathname?.startsWith(item.href) ? 'text-foreground' : 'text-foreground/60'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
