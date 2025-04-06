import React, { useState } from 'react';

const AnimeSearch = () => {

    const app_name = '194.195.211.99';
    function buildPath(route: string): string {
        if (import.meta.env.NODE_ENV !== 'development') {
            return 'http://' + app_name + ':5000/' + route;
        } else {
            return 'http://localhost:5000/' + route;
        }
    }

  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [status, setStatus] = useState('');
  interface Anime {
    animeId: number;
    imageURL: string;
    title: string;
    air_day: string;
    airing: boolean;
    synopsis?: string;
  }

  const [results, setResults] = useState<Anime[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    try {
      const body = {
        searchParams: {
          q: query,
          type: type,
          minScore: minScore,
          maxScore: maxScore,
          status: status
        }
      };

const response = await fetch(buildPath('api/searchAnime'), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

      const data = await response.json();
      if (response.ok) {
        setResults(data.data);
        setError('');
      } else {
        setError(data.error || 'Search failed.');
        setResults([]);
      }
    } catch (err) {
      setError('Server error.');
      setResults([]);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Search Anime</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} className="p-2 border rounded" />
        <input type="text" placeholder="Type (TV, Movie, etc.)" value={type} onChange={(e) => setType(e.target.value)} className="p-2 border rounded" />
        <input type="number" placeholder="Min Score" value={minScore} onChange={(e) => setMinScore(e.target.value)} className="p-2 border rounded" />
        <input type="number" placeholder="Max Score" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} className="p-2 border rounded" />
        <input type="text" placeholder="Status (airing, complete)" value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border rounded" />
      </div>
      <button onClick={handleSearch} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Search</button>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((anime) => (
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

export default AnimeSearch;
