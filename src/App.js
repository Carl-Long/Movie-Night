import React, { useState, useEffect } from 'react';
import './App.css';
import MovieTile from './MovieTile';

const api_key = '65758923a4428c1a48dbf0f29234d763'
//sample  call = https://api.themoviedb.org/3/movie/550?api_key=65758923a4428c1a48dbf0f29234d763

const API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${api_key}`
//get provider = https://api.themoviedb.org/3/movie/This is movie id 886396/watch/providers?api_key=65758923a4428c1a48dbf0f29234d763
//(data.results.GB.flatrate[0].provider_name) gets streaming platform
const BASE_URL = 'https://api.themoviedb.org/3/movie/'


//https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&language=en-US&sort_by=popularity.desc&with_genres={genre}&with_watch_monetization_types=flatrate


function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('')
  const [resultTerm, setResultTerm] = useState('_')
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
 // const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [genres, setGenres] = useState([])

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      search(searchTerm)
    }
  }

  const handleGenreChange = e => {
    if (e.target.value !== '') {
      let genre = e.target.value.split(',')[0];
      let genreId = e.target.value.split(',')[1];
      getByGenre(genre, genreId);
    }
    else {
      search('');
    }
  }

  const getGenreList = async () => {
    const getgenres = `https://api.themoviedb.org/3/genre/movie/list?api_key=${api_key}&language=en-US`
    const response = await fetch(`${getgenres}`);
    let data = await response.json();
    data = data.genres;

    //removes documentary from genres
    data.splice([5], 1)
    setGenres(data);
  }

  const getByGenre = async (genre, genreId) => {
    setSearching(true);
    setResultTerm(genre);
    const getByGenreUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&language=en-US&sortby=popularity.desc&with_genres=${genreId}&watch_region=GB&with_watch_monetization_types=flatrate`;
    const response = await fetch(`${getByGenreUrl}`);
    let data = await response.json();
    data = data.results;
    const ids = data.map((data) => {
      return data.id;
    })

    let streamingInfo = await getStreamingPlatforms(ids);
    let finalData = addStreamInfoToMovies(data, streamingInfo);

    for (let i = 0; i < finalData.length; i++) {
      if (finalData[i].providers[0] === 'Virgin TV Go') {
        finalData.splice([i], 1);
        i--;
      }
    }

    setMovies(finalData);
    setSearching(false);
    setHasSearched(true);
  }

  const getTrending = async () => {
    setSearching(true);
    setResultTerm('trending');
    const getTrendingUrl = `https://api.themoviedb.org/3/trending/movie/day?api_key=${api_key}`;
    const response = await fetch(`${getTrendingUrl}`);
    let data = await response.json();
    data = data.results;
    const ids = data.map((data) => {
      return data.id;
    })
    let streamingInfo = await getStreamingPlatforms(ids);

    let finalData = addStreamInfoToMovies(data, streamingInfo);

    //Only shows streamable results
    //if(onlyAvailable === true){
    //for(let i = 0; i < finalData.length; i++){
    //  if(finalData[i].providers[0] === 'not available'){
    //    finalData.splice([i], 1);
    //    i--;
    //console.log(finalData);
    //console.log(finalData[i].original_title);
    //  }
    //}
    //}

    setMovies(finalData);
    setSearching(false);
    setHasSearched(true);

  }

  const getTopRated = async () => {
    setSearching(true);
    setResultTerm('Top Rated');

    const getTopRatedUrl = `https://api.themoviedb.org/3/movie/top_rated?api_key=${api_key}&language=en-US&region=GB`;
    const response = await fetch(`${getTopRatedUrl}`);
    let data = await response.json();
    data = data.results;
    const ids = data.map((data) => {
      return data.id;
    })
    let streamingInfo = await getStreamingPlatforms(ids);

    let finalData = addStreamInfoToMovies(data, streamingInfo);

    setMovies(finalData);
    setSearching(false);
    setHasSearched(true);
  }


  function getRandomNumber(min, max) {
    // get number between min (inclusive) and max (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const getRandom = async () => {
    setSearching(true);
    setResultTerm('Random Selection');
    let randomPage = getRandomNumber(1, 15);
    let randomMovie = getRandomNumber(0, 19);
    console.log(randomMovie, randomPage);

    const getRandomUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&language=en-US&region=GB&sort_by=popularity.desc&page=${randomPage}&watch_region=GB&with_watch_monetization_types=flatrate`;
    const response = await fetch(`${getRandomUrl}`);
    let data = await response.json();
    data = data.results;
    const ids = data.map((data) => {
      return data.id;
    })

    let streamingInfo = await getStreamingPlatforms(ids);
    let finalData = addStreamInfoToMovies(data, streamingInfo);

    finalData = [finalData[randomMovie]];
    if (finalData[0].providers[0] === 'Virgin TV Go') {
      getRandom();
    }
    else {

      setMovies(finalData);
      setSearching(false);
      setHasSearched(true);
    }
  }

  const search = async (title) => {
    if (title === '' || title === ' ') {
      title = '_';
    }
    setSearching(true)
    setResultTerm(title);

    const response = await fetch(`${API_URL}&query=${title}`);
    let data = await response.json();
    data = data.results.slice(0, 10);
    const ids = data.map((data) => {
      return data.id;
    })

    let streamingInfo = await getStreamingPlatforms(ids);

    let finalData = addStreamInfoToMovies(data, streamingInfo);
    console.log(finalData);

    setMovies(finalData);
    setSearching(false);
    setHasSearched(true);
  }

  const getStreamingPlatforms = async (ids) => {
    let streamingInfo = [];
    for (let i = 0; i < ids.length; i++) {
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
      if ((typeof streamingInfo[i] === 'undefined')
        || (!streamingInfo[i].hasOwnProperty('flatrate')
          && (!streamingInfo[i].hasOwnProperty('ads')))) {
        providers.push('not available')
      }

      else {
        if (streamingInfo[i].hasOwnProperty('flatrate')) {
          for (let j = 0; j < streamingInfo[i].flatrate.length; j++) {
            providers.push(streamingInfo[i].flatrate[j].provider_name);
            logoPath.push(streamingInfo[i].flatrate[j].logo_path);
          }
        }
        if (streamingInfo[i].hasOwnProperty('ads')) {
          for (let k = 0; k < streamingInfo[i].ads.length; k++) {
            providers.push(streamingInfo[i].ads[k].provider_name);
            logoPath.push(streamingInfo[i].ads[k].logo_path);
          }
        }
      }
      data[i].providers = providers;
      data[i].providers_logo_path = logoPath;
      providers = [];
      logoPath = [];
    }

    return data;
  }

  useEffect(() => {
    getGenreList();
  }, []);

  return (
    <div className='app'>

      <div className='header'>
        <h1>It's Movie Night</h1>
        <div className='search'>
          <input
            placeholder='Search for a movie'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button className='go' onClick={() => search(searchTerm)}>Go</button>
        </div>
        <div className='preSelectedSearch'>
          {
            <select className='selectBar' label='Genres' onChange={handleGenreChange}>
              <option className='genre' key='0' value={''}>Genres...</option>
              {
                genres.map((genre) => (
                  <option className='genre' key={genre.id} value={[genre.name, genre.id]}>{genre.name}</option>
                ))}
            </select>
          }
          <button className='option' onClick={() => getTrending()}>Trending</button>
          <button className='option' onClick={() => getTopRated()}>Top Rated</button>
          <button className='option' onClick={() => getRandom()}>Surprise me</button>
        </div>
      </div>
      <div className='results'>
        {
          resultTerm === '_'
            ? (
              <div>Search for a movie to check whether it can be streamed in the UK
                or select an option to get some inspiration!</div>
            ) : (searching === true ? (
              <div> Searching for {resultTerm}... </div>
            ) : hasSearched === true ? (<div>Showing {movies.length} results for '{resultTerm}'</div>
            ) : <div></div>)
        }
      </div>
      {
        movies.length > 0
          ? (
            <div className='container'>
              {
                movies.map((movie) => (
                  <MovieTile key={movie.id} movie={movie} />
                ))}
            </div>
          ) : (movies.length === 0 && hasSearched === true ? (
            <div className='empty'>
              <h2>No movies found</h2>
            </div>
          ) : <div></div>)

      }
    </div>
  );
}

export default App;
