const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const morgan = require('morgan');
app.use(morgan('dev'));

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin123',
    database: 'movie_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Route to display form for admin
app.get('/admin', (req, res) => {
    res.render('admin');
});

// Route to handle form submission
app.post('/admin', (req, res) => {
    const { movie_name, movie_link } = req.body;
    const sql = `INSERT INTO movies (movie_name, movie_link) VALUES (?, ?)`;
    db.query(sql, [movie_name, movie_link], (err, result) => {
        if (err) throw err;
        res.redirect('/admin');
    });
});

// Route for user search
app.get('/search', (req, res) => {
    res.render('search');
});

// Route to handle search results
app.post('/search', (req, res) => {
    const searchQuery = req.body.movie_name;
    const sql = `SELECT * FROM movies WHERE movie_name LIKE ?`;
    db.query(sql, [`%${searchQuery}%`], (err, results) => {
        if (err) throw err;
        res.render('results', { movies: results });
    });
});

// Redirect to movie link when clicked
app.get('/movie/:id', (req, res) => {
    const movieId = req.params.id;
    const sql = `SELECT movie_link FROM movies WHERE id = ?`;
    db.query(sql, [movieId], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.redirect(result[0].movie_link);
        } else {
            res.send('Movie not found');
        }
    });
});

const port = 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
