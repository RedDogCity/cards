import React, { useEffect, useState } from 'react';

// the userId value is estracted and made available as a standalone variable.
const UserAlertList = ({userId}: {userId: string}) => {

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

    // stores the list of anime aler fetched from the backend
    const [animeList, setAnimeList] = useState<Anime[]>([]);
    const [error, setError] = useState('');

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

      return (
        <div className="p-4 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Your Anime Alerts</h1>
          {error && <p className="text-red-600">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animeList.map((anime) => (
              <div key={anime.animeId} className="border rounded p-4 shadow hover:shadow-lg">
                <img src={anime.imageURL} alt={anime.title} className="w-full h-64 object-cover mb-2 rounded" />
                <h2 className="text-xl font-semibold mb-1">{anime.title}</h2>
                <p className="text-sm text-gray-600 mb-2">{anime.air_day} | {anime.airing ? 'Airing' : 'Completed'}</p>
                <p className="text-sm">{anime.synopsis?.substring(0, 150)}...</p>
              </div>
            ))}
          </div>
        </div>
      );
};
export default UserAlertList;