import { useRouter } from 'next/router';
import PokedexEntryDisplay from '../../../components/PokedexEntryDisplay';

const PokedexEntryPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1>Pokedex Entry {id}</h1>
      <PokedexEntryDisplay id={id} />
    </div>
  );
};

export default PokedexEntryPage;
