export default function PokedexEntryPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Pokedex Entry {params.id}</h1>
      <div className="border rounded-lg p-6">
        <p className="text-gray-600">Details for entry {params.id} would be displayed here.</p>
      </div>
    </div>
  );
}
