export default function Paginacao({
  pagina,
  totalPaginas,
  onMudar,
}: {
  pagina: number; // começa em 0
  totalPaginas: number;
  onMudar: (pagina: number) => void;
}) {
  if (totalPaginas <= 1) return null;

  const inicio = Math.max(0, Math.min(pagina - 2, totalPaginas - 5));
  const fim = Math.min(totalPaginas, inicio + 5);
  const numeros = Array.from({ length: fim - inicio }, (_, i) => inicio + i);

  const base = "rounded border px-3 py-1.5 text-sm";

  return (
    <nav aria-label="Paginação" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        onClick={() => onMudar(pagina - 1)}
        disabled={pagina === 0}
        className={`${base} border-gray-300 disabled:opacity-40`}
      >
        Anterior
      </button>

      {numeros.map((n) => (
        <button
          key={n}
          onClick={() => onMudar(n)}
          aria-current={n === pagina ? "page" : undefined}
          className={`${base} ${
            n === pagina ? "border-blue-700 bg-blue-700 text-white" : "border-gray-300"
          }`}
        >
          {n + 1}
        </button>
      ))}

      <button
        onClick={() => onMudar(pagina + 1)}
        disabled={pagina >= totalPaginas - 1}
        className={`${base} border-gray-300 disabled:opacity-40`}
      >
        Próxima
      </button>
    </nav>
  );
}
