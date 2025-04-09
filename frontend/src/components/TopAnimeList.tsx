import { useEffect, useState } from 'react';

const TopAnimeList = ({ userId }: { userId: string }) => {
  const app_name = '194.195.211.99';
  const buildPath = (route: string) =>
    import.meta.env.NODE_ENV !== 'development'
      ? `http://${app_name}:5000/${route}`
      : `http://localhost:5000/${route}`;

  interface Anime {
    animeId: number;
    imageURL: string;
    title: string;
    air_day: string;
    airing: boolean;
    synopsis?: string;
  }

  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState<number | null>(null);
  const [userAlerts, setUserAlerts] = useState<number[]>([]); // 

  useEffect(() => {
    const fetchTopAnime = async () => {
      try {
        const response = await fetch(buildPath('api/getTopAnime'), {
          method: 'POST'
        });

        const result = await response.json();
        if (response.ok && result.data) {
          setAnimeList(result.data.slice(0, 20)); // top 20 only
          setError('');
        } else {
          setError(result.error || 'Could not fetch top anime.');
        }
      } catch (err) {
        setError('Server error while loading anime.');
      }
    };

    fetchTopAnime();
  }, []);

  const fetchUserAlerts = async () => {
    try {
      const response = await fetch(buildPath('api/getAnimeAlerts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      });
      const data = await response.json();
      if (response.ok) {
        const ids = data.anime.map((a: Anime) => a.animeId);
        setUserAlerts(ids);
      }
    } catch (err) {
      console.error('Failed to fetch user alerts');
    }
  };

  const handleAddAlert = async (animeId: number) => {
    if (userAlerts.includes(animeId)) {
      setError('Anime already in your alert list.');
      return;
    }

    try {
      const response = await fetch(buildPath('api/addAlert'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, animeId })
      });

      const data = await response.json();
      if (response.ok) {
        setUserAlerts([...userAlerts, animeId]);
        setError('');
      } else {
        setError(data.error || 'Failed to add alert.');
      }
    } catch (err) {
      setError('Server error while adding alert.');
    }
  };

  useEffect(() => {
    if (userId) fetchUserAlerts();
  }, [userId]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-white">Top 20 Anime</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {animeList.map((anime) => (
          <div key={anime.animeId} className="border rounded p-4 shadow hover:shadow-lg bg-white relative">
            <img src={anime.imageURL} alt={anime.title} className="w-full h-56 object-cover rounded mb-2" />
            <h2 className="text-xl font-semibold mb-1">{anime.title}</h2>
            <p className="text-sm text-gray-600 mb-2">{anime.air_day} | {anime.airing ? 'Airing' : 'Completed'}</p>
            <p className="text-sm mb-3">{anime.synopsis?.substring(0, 120)}...</p>
            {!userAlerts.includes(anime.animeId) && (
            <button
              className={`w-full px-4 py-2 rounded font-bold transition ${
                successId === anime.animeId
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              onClick={() => handleAddAlert(anime.animeId)}
            >
              {successId === anime.animeId ? 'Added!' : 'Add to Alerts'}
            </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopAnimeList;