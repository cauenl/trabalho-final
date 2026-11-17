import type { ReactNode } from "react";

import Protegido from "@/components/Protegido";
import SubMenu from "@/components/SubMenu";

// Área do cliente: só o perfil USER entra (os outros vão para a própria área).
export default function LayoutCliente({ children }: { children: ReactNode }) {
  return (
    <Protegido perfis={["USER"]}>
      <SubMenu
        raiz="/cliente"
        itens={[
          { href: "/cliente", rotulo: "Resumo" },
          { href: "/cliente/ofertas", rotulo: "Minhas ofertas" },
          { href: "/cliente/favoritos", rotulo: "Favoritos" },
          { href: "/cliente/contratos", rotulo: "Contratos" },
        ]}
      />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </Protegido>
  );
}
