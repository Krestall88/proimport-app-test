'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/warehouse', label: 'Панель управления' },
  // { href: '/warehouse/customer-orders', label: 'Заказы клиентов' }, // Добавим позже
  // { href: '/warehouse/reports', label: 'Отчеты' }, // Добавим позже
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white p-4">
      <nav>
        <ul>
          {links.map(link => (
            <li key={link.href}>
              <Link href={link.href} className={`block py-2 px-4 rounded hover:bg-gray-700 ${pathname === link.href ? 'bg-gray-700' : ''}`}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
