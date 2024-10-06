const express = require('express');
const path = require('path');

const app = express();
const PORT = 3243; // Use any port that is not 3000 or 8080

// Serve static files from the public folder
app.use(express.static('public'));

// Redirect route
app.get('/', (req, res) => {
    res.redirect('/about');
});

// About route
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Express http server listening on port ${PORT}`);
});
