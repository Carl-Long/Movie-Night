import { useState, useEffect } from 'react';
import './App.css';
import MovieTile from './MovieTile';


const api_key = '65758923a4428c1a48dbf0f29234d763'
//sample  call = https://api.themoviedb.org/3/movie/550?api_key=65758923a4428c1a48dbf0f29234d763

const API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${api_key}`
//get provider = https://api.themoviedb.org/3/movie/This is movie id 886396/watch/providers?api_key=65758923a4428c1a48dbf0f29234d763
//(data.results.GB.flatrate[0].provider_name) gets streaming platform


function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('')

  const getStreamingPlatforms = async (ids) => {
    let streamingInfo = [];
    for (let i = 0; i< ids.length; i++) {
      let response = await fetch(`https://api.themoviedb.org/3/movie/${ids[i]}/watch/providers?api_key=${api_key}`);
      let data = await response.json();
      data = data.results.GB;
      streamingInfo.push(data)    
    }
    return streamingInfo;
  }

  const addStreamInfoToMovies = (data, streamingInfo) => {
      let providers = [];
      let logoPath = [];

      for (let i = 0; i < streamingInfo.length; i++) {
        if (typeof streamingInfo[i] === 'undefined' || !streamingInfo[i].hasOwnProperty('flatrate')) {
            data[i].providers = 'not available';
        }
        else {
          for (let j = 0; j < streamingInfo[i].flatrate.length; j++) {
            providers.push(streamingInfo[i].flatrate[j].provider_name);
            logoPath.push(streamingInfo[i].flatrate[j].logo_path);
            }

          console.log(streamingInfo[i].flatrate.length);
          data[i].providers = providers;
          data[i].providers_logo_path = logoPath;
        }
        providers = [];
        logoPath = [];
      }
      return data;
    }
    

  const search = async (title) => {
    const response = await fetch(`${API_URL}&query=${title}`);
    let data = await response.json();
    data = data.results;
    const ids = data.map((data) => {
        return data.id;
    })
    console.log(ids);
    let streamingInfo = await getStreamingPlatforms(ids);

    console.log(streamingInfo);

    let finalData = addStreamInfoToMovies(data, streamingInfo);

    console.log(finalData);

    setMovies(finalData);

  }

  useEffect(() =>{
    search('batman');
  }, []);
  return (
    <div className='app'>
      <h1>Movie Night</h1>
      <div className='search'>
        <input
          placeholder='Search for a movie'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          />
          <img
            //src={searchIcon}
            //alt='search'
            //onClick={() => search(seachTerm)}
            alt=';'
          />
      </div>

      {
        movies.length > 0
        ? (
          <div className='container'>
          {
            movies.map((movie) => (
              <MovieTile movie={movie} />
            ))}
          </div>
        ) : (
          <div className='empty'>
            <h2>No movies found</h2>
            </div>
        )
      }
    
    </div>
  );
}

export default App;
