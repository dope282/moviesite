const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const app = express();
const port = 3000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Add unique timestamp
    }
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// Movies endpoint
let movies = [];


// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory
app.use(session({
    secret: 'password', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to false for testing on http
}));

app.use(express.urlencoded({ extended: true })); // Parse form data

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html')); // Serve your login page
});

// Handle login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log("Attempting login with:", username); // Debug log
    if (username === 'admin' && password === 'password') {
        req.session.loggedIn = true;
        res.redirect('/admin.html'); // Redirect to admin page after login
    } else {
        console.log("Login failed, redirecting to /login");
        res.redirect('/login'); // Redirect back to login on failure
    }
});

// Middleware to check if the user is logged in
function checkAuth(req, res, next) {
    if (req.session.loggedIn) {
        next(); // If logged in, proceed to the admin page
    } else {
        res.redirect('/login'); // If not logged in, redirect to login page
    }
}

// Restrict access to /admin.html
app.get('/admin.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'secure', 'admin.html')); // Serve the admin page
});

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: 'your_password', // Your MySQL password
    database: 'movies' // Your database name
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database error:', err);
        return;
    }
    console.log('Connected to the database');
});

// Add a movie (Admin)
app.post('/api/movies', upload.single('movie_image'), (req, res) => {
    const { name, link } = req.body;
    const query = 'INSERT INTO movies (name, link) VALUES (?, ?)';
    db.query(query, [name, link], (err, results) => {
        if (err) {
            console.error('Error inserting movie:', err);
            return res.status(500).json({ message: 'Error adding movie' });
        }
        res.status(201).json({ message: 'Movie added successfully', id: results.insertId });
    });
});

// GET all movies
app.get('/api/movies', (req, res) => {
    const searchTerm = req.query.name;
    let sql = 'SELECT * FROM movies';
    if (searchTerm) {
        sql += ' WHERE name LIKE ?'; // Use LIKE for partial matching
    }
    db.query(sql, searchTerm ? [`%${searchTerm}%`] : [], (err, results) => {
        if (err) {
            console.error('Error fetching movies:', err);
            return res.status(500).json({ error: 'Error fetching movies' });
        }
        res.json(results);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
