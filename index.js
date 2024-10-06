const express = require('express');
const app = express();
const path = require('path');
const contentService = require('./content-service'); // Import the content service module

// Middleware to serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Redirect from the root route to the /about route
app.get('/', (req, res) => {
    res.redirect('/about');
});

// Load articles data using the content service
app.get('/api/articles', (req, res) => {
    contentService.getPublishedArticles() // Call the service function
        .then(articles => res.json(articles)) // Send the articles as response
        .catch(err => res.status(500).json({ message: err })); // Handle errors
});

// Load categories data using the content service
app.get('/api/categories', (req, res) => {
    contentService.getCategories() // Call the service function
        .then(categories => res.json(categories)) // Send the categories as response
        .catch(err => res.status(500).json({ message: err })); // Handle errors
});

// Route to serve the about.html file
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Use the port provided by Vercel or fallback to 3001 if not defined
const PORT = process.env.PORT || 3003; 

// Initialize content service when the server starts
contentService.initialize()
    .then(() => {
        console.log('Content service initialized successfully.');

        // Start the server only after initialization
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error initializing content service:', err);
        process.exit(1); // Exit the process if initialization fails
    });
