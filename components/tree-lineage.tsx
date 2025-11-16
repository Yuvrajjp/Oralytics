interface TreeLineageProps {
  lineage: string[];
}

export default function TreeLineage({ lineage }: TreeLineageProps) {
  if (!lineage || lineage.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 rounded-xl border border-slate-100/80 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">Evolutionary lineage</h3>
      <div className="mt-4 space-y-3">
        {lineage.map((entry, index) => (
          <div key={`${entry}-${index}`} className="flex items-center gap-3 text-slate-600">
            <div className="h-2 w-2 rounded-full bg-slate-900" />
            <p>{entry}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
