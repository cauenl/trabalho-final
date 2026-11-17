import type { ItemGrafico } from "@/types/negocio";

const CORES = ["#1d4ed8", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#be185d", "#4b5563"];

// Barras horizontais em SVG/HTML simples (sem biblioteca).
export function GraficoBarras({ titulo, itens }: { titulo: string; itens: ItemGrafico[] }) {
  const maximo = Math.max(1, ...itens.map((i) => i.total));
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4" aria-label={titulo}>
      <h2 className="mb-3 font-semibold text-gray-900">{titulo}</h2>
      {itens.length === 0 ? (
        <p className="text-sm text-gray-500">Sem dados.</p>
      ) : (
        <ul className="space-y-2">
          {itens.map((i, n) => (
            <li key={i.rotulo} className="text-sm">
              <div className="flex justify-between">
                <span>{i.rotulo}</span>
                <span className="font-medium">{i.total}</span>
              </div>
              <div className="h-3 rounded bg-gray-100">
                <div
                  className="h-3 rounded"
                  style={{ width: `${(i.total / maximo) * 100}%`, background: CORES[n % CORES.length] }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Rosca com legenda.
export function GraficoRosca({ titulo, itens }: { titulo: string; itens: ItemGrafico[] }) {
  const total = itens.reduce((s, i) => s + i.total, 0);
  const raio = 15.9155; // circunferência = 100
  const fatias = itens
    .map((item, n) => ({ item, cor: CORES[n % CORES.length], parte: total ? (item.total / total) * 100 : 0 }))
    .filter((f) => f.parte > 0)
    .map((f, n, todas) => ({ ...f, inicio: todas.slice(0, n).reduce((s, x) => s + x.parte, 0) }));

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4" aria-label={titulo}>
      <h2 className="mb-3 font-semibold text-gray-900">{titulo}</h2>
      {total === 0 ? (
        <p className="text-sm text-gray-500">Sem dados.</p>
      ) : (
        <div className="flex items-center gap-6">
          <svg viewBox="0 0 42 42" className="h-36 w-36 shrink-0 -rotate-90" role="img" aria-label={titulo}>
            <circle cx="21" cy="21" r={raio} fill="none" stroke="#e5e7eb" strokeWidth="6" />
            {fatias.map((f) => (
              <circle
                key={f.item.rotulo}
                cx="21"
                cy="21"
                r={raio}
                fill="none"
                stroke={f.cor}
                strokeWidth="6"
                strokeDasharray={`${f.parte} ${100 - f.parte}`}
                strokeDashoffset={-f.inicio}
              />
            ))}
          </svg>
          <ul className="space-y-1 text-sm">
            {itens.map((i, n) => (
              <li key={i.rotulo} className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ background: CORES[n % CORES.length] }} />
                {i.rotulo}: <b>{i.total}</b>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
