import type { ReactNode } from "react";

import Protegido from "@/components/Protegido";
import SubMenu from "@/components/SubMenu";

// Painel do administrador.
export default function LayoutAdmin({ children }: { children: ReactNode }) {
  return (
    <Protegido perfis={["ADMIN"]}>
      <SubMenu
        raiz="/admin"
        itens={[
          { href: "/admin", rotulo: "Painel" },
          { href: "/admin/imoveis", rotulo: "Imóveis" },
          { href: "/admin/fotos", rotulo: "Fotos" },
          { href: "/admin/bairros", rotulo: "Bairros" },
          { href: "/admin/tipos", rotulo: "Tipos de imóvel" },
          { href: "/admin/usuarios", rotulo: "Usuários" },
          { href: "/admin/ofertas", rotulo: "Ofertas" },
          { href: "/admin/contratos", rotulo: "Contratos" },
        ]}
      />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </Protegido>
  );
}
