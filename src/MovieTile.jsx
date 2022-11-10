import React from 'react';

const IMAGE_URL = 'https://image.tmdb.org/t/p/w342/';
const LOGO_URL = 'https://image.tmdb.org/t/p/w92';

const MovieTile = ({ movie }) => {
  return (

    <div className='movie'>
      <div>
        <img
          src={movie.poster_path !== null ? `${IMAGE_URL}${movie.poster_path}` : 'https://via.placeholder.com/400'}
          alt={movie.original_title}
        />
      </div>
      <span> {movie.original_title}{' ('}{movie.release_date}{')'} {movie.vote_average.toFixed(1)}{' / 10'}</span>
      <div className='platforms'>
        {
          movie.providers[0] !== 'not available'
            ? (
              <div className='available'>
                {
                  movie.providers_logo_path.map(i => (
                    <img src={`${LOGO_URL}${i}`}
                      alt={`${movie.providers[i]}`}
                    />
                  ))
                }
              </div>
            ) : (<div className='notAvailable'><h3> Not available</h3></div>

            )
        }
      </div>
    </div>
  )
}

export default MovieTile;