import type { ReactNode } from "react";

import Protegido from "@/components/Protegido";
import SubMenu from "@/components/SubMenu";

// Área do corretor: aceita ofertas e prepara contratos.
export default function LayoutCorretor({ children }: { children: ReactNode }) {
  return (
    <Protegido perfis={["CORRETOR"]}>
      <SubMenu
        raiz="/corretor"
        itens={[
          { href: "/corretor", rotulo: "Ofertas" },
          { href: "/corretor/contratos", rotulo: "Contratos" },
        ]}
      />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </Protegido>
  );
}
