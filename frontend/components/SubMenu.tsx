"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface ItemMenu {
  href: string;
  rotulo: string;
}

// menu de abas de uma área (cliente, corretor, admin)
export default function SubMenu({ itens, raiz }: { itens: ItemMenu[]; raiz: string }) {
  const caminho = usePathname();

  return (
    <nav aria-label="Seções" className="border-b border-gray-200 bg-gray-50">
      <ul className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 text-sm">
        {itens.map((item) => {
          const ativo = item.href === raiz ? caminho === raiz : caminho.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`block border-b-2 px-3 py-2.5 ${
                  ativo
                    ? "border-blue-700 font-semibold text-blue-800"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
