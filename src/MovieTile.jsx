import React from 'react';

const IMAGE_URL = 'https://image.tmdb.org/t/p/w342/';
const LOGO_URL = 'https://image.tmdb.org/t/p/w92';

const MovieTile = ( {movie} ) => {
    return (
        <div className='movie'>
            <div>
            <p>{movie.release_date}</p>
            </div>
        <div>
          <img 
          src={movie.poster_path !== null ? `${IMAGE_URL}${movie.poster_path}` : 'https://via.placeholder.com/400'} 
          alt={movie.original_title}
          />
        </div>

        <div>
          <span>{movie.original_title}{'  ('}{movie.vote_average}{' out of 10)'}</span>
          {
            movie.providers !== 'not available' 
            ? (
              <div className='platforms'>
                {
                  movie.providers_logo_path.map(i => (
                    <img src={`${LOGO_URL}${i}`} 
                         alt='streaming platform'
                    />
                  ))
                }
                </div>
            ) : ( <div><h3> Not available</h3></div>

            )
          }
          <div>
          </div>
        </div>
      </div>
    )
}

export default MovieTile;