import PokedexEntryDisplay from '@/components/pokedex-entry-display';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PokedexEntryPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-semibold text-white mb-8">Pokedex Entry {id}</h1>
      <PokedexEntryDisplay />
    </main>
  );
}
