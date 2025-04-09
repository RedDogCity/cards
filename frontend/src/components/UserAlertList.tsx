import { useEffect, useState } from 'react';

const UserAlertList = ({ userId }: { userId: string }) => {
  const app_name = '194.195.211.99';
  function buildPath(route: string): string {
    if (import.meta.env.NODE_ENV !== 'development') {
      return 'http://' + app_name + ':5000/' + route;
    } else {
      return 'http://localhost:5000/' + route;
    }
  }

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
  const [removalTarget, setRemovalTarget] = useState<number | null>(null); // animeId to confirm

  useEffect(() => {
    const fetchAnimeAlerts = async () => {
      try {
        const response = await fetch(buildPath('api/getAnimeAlerts'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: userId })
        });

        const data = await response.json();
        if (response.ok) {
          setAnimeList(data.anime);
          setError('');
        } else {
          setError(data.error || 'Failed to fetch alerts.');
        }
      } catch (err) {
        setError('Server error while fetching alerts.');
      }
    };

    if (userId) fetchAnimeAlerts();
  }, [userId]);

  const handleRemove = async (animeId: number) => {
    try {
      const response = await fetch(buildPath('api/removeAlert'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, animeId })
      });

      const data = await response.json();
      if (response.ok && data.error === '') {
        setAnimeList(animeList.filter((anime) => anime.animeId !== animeId));
        setRemovalTarget(null);
      } else {
        setError(data.error || 'Failed to remove alert.');
      }
    } catch (err) {
      setError('Server error while removing alert.');
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4  text-white">Your Anime Alerts</h1>
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {animeList.map((anime) => (
          <div key={anime.animeId} className="border rounded p-4  bg-white relative shadow hover:shadow-lg relative">
            <img src={anime.imageURL} alt={anime.title} className="w-full h-64 object-cover mb-2 rounded" />
            <h2 className="text-xl font-semibold mb-1">{anime.title}</h2>
            <p className="text-sm text-gray-600 mb-2">{anime.air_day} | {anime.airing ? 'Airing' : 'Completed'}</p>
            <p className="text-sm mb-3">{anime.synopsis?.substring(0, 150)}...</p>

            {/* Minus button */}
            <button
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm hover:bg-red-600"
              onClick={() => setRemovalTarget(anime.animeId)}
            >
              -
            </button>

            {/* Are you sure? */}
            {removalTarget === anime.animeId && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white p-4 rounded">
                <p className="mb-2 text-center">Are you sure you want to remove this alert?</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleRemove(anime.animeId)}
                    className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setRemovalTarget(null)}
                    className="bg-gray-400 hover:bg-gray-500 px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserAlertList;