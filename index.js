const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

// Middleware to serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Redirect from the root route to the /about route
app.get('/', (req, res) => {
    res.redirect('/about');
});

// Load articles data
app.get('/api/articles', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'articles.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading articles data');
        }
        res.json(JSON.parse(data));
    });
});

// Load categories data
app.get('/api/categories', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading categories data');
        }
        res.json(JSON.parse(data));
    });
});

// Route to serve the about.html file
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Use a unique port (change this to any port that is not 3000 or 8080)
const PORT = 3002; 
app.listen(PORT, () => {
    console.log(`Express http server listening on port ${PORT}`);
});
