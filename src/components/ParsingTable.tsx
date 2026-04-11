interface ParsingTableProps {
  table: Map<string, Map<string, string>>;
  nonTerminals: string[];
  terminals: string[];
}

export function ParsingTable({ table, nonTerminals, terminals }: ParsingTableProps) {
  const columns = [...terminals, '$'];

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-primary text-primary-foreground">
            <th className="px-3 py-2 text-left font-semibold border-r border-primary-foreground/20">NT</th>
            {columns.map(t => (
              <th key={t} className="px-3 py-2 text-center font-semibold border-r border-primary-foreground/20 last:border-r-0">
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nonTerminals.map((nt, i) => (
            <tr key={nt} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
              <td className="px-3 py-2 font-bold text-primary border-r border-border">{nt}</td>
              {columns.map(t => {
                const cell = table.get(nt)?.get(t) || '';
                const hasConflict = cell.includes('/');
                return (
                  <td
                    key={t}
                    className={`px-3 py-2 text-center border-r border-border last:border-r-0 font-mono text-xs ${hasConflict ? 'bg-destructive/10 text-destructive font-bold' : 'text-foreground'}`}
                  >
                    {cell || '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
