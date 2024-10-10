document.getElementById('searchButton').addEventListener('click', async () => {
    const movieName = document.getElementById('searchInput').value.trim();
    
    if (movieName) {
        await searchMovies(movieName); // Call search function
    }
});

// Function to search for movies by name
async function searchMovies(name) {
    try {
        const response = await fetch('/api/movies'); // Fetch all movies
        const movies = await response.json();
        
        const movieList = document.getElementById('movieList');
        movieList.innerHTML = ''; // Clear existing results

        // Filter movies by name
        const filteredMovies = movies.filter(movie => movie.name.toLowerCase().includes(name.toLowerCase()));

        // Display the filtered movie results
        filteredMovies.forEach(movie => {
            const listItem = document.createElement('li');
            // Set up clickable link that redirects to the movie's URL
            listItem.innerHTML = `<a href="${movie.link}" target="_blank">${movie.name}</a>`;
            movieList.appendChild(listItem);
        });

        // If no movies found, display a message
        if (filteredMovies.length === 0) {
            const noResults = document.createElement('li');
            noResults.innerText = 'No movies found.';
            movieList.appendChild(noResults);
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}
