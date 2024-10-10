document.getElementById('movieForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const movieName = document.getElementById('movieName').value.trim();
    const movieLink = document.getElementById('movieLink').value.trim();
    const movieImage = document.getElementById('movie_image').files[0]; // Image file

    if (movieName && movieLink) {
        const formData = new FormData();
        formData.append('name', movieName);
        formData.append('link', movieLink);
        if (movieImage) {
            formData.append('movie_image', movieImage);
        }

        const response = await fetch('/api/movies', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        const responseMessage = document.getElementById('responseMessage');

        if (response.ok) {
            responseMessage.innerText = 'Movie added successfully!';
            fetchMovies(); // Refresh movie list
            document.getElementById('movieForm').reset(); // Clear the form
        } else {
            responseMessage.innerText = `Error adding movie: ${result.message}`;
        }
    } else {
        alert('Please fill out both fields.');
    }
});

// Fetch movies and display them
async function fetchMovies() {
    const response = await fetch('/api/movies');
    const movies = await response.json();
    const movieTableBody = document.getElementById('movieTable').getElementsByTagName('tbody')[0];
    movieTableBody.innerHTML = ''; // Clear the existing rows

    movies.forEach(movie => {
        const row = movieTableBody.insertRow();
        row.insertCell(0).textContent = movie.id;
        row.insertCell(1).textContent = movie.name;
        row.insertCell(2).innerHTML = `<a href="${movie.link}" target="_blank">Watch</a>`;
        row.insertCell(3).innerHTML = movie.image ? `<img src="/uploads/${movie.image}" alt="Movie Image" width="100">` : 'No Image';
    });
}

// Load movies on page load
window.onload = fetchMovies;
