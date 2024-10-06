const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
