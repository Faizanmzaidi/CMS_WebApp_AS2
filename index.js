const express = require('express');
const app = express();
const path = require('path');
const contentService = require('./content-service'); // Import the content service module
const multer = require("multer"); // For file upload handling
const cloudinary = require('cloudinary').v2; // For image upload to Cloudinary
const streamifier = require('streamifier'); // For streaming file data

// Middleware to serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON data in the request body
app.use(express.json());

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dgwtvfcvi',  // Replace with your Cloudinary cloud name
    api_key: '979985964582327',        // Replace with your Cloudinary API key
    api_secret: 'XCI9kGGhQoniGoSJaLqkS7zAKRQ',  // Replace with your Cloudinary API secret
    secure: true
});

// Configure multer for handling file uploads in memory
const upload = multer(); // No disk storage, files are stored in memory

// Redirect from the root route to the /articles/add route
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

// Route to serve the addArticle.html file
app.get('/articles/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addArticle.html'));
});

// New Route to serve the editArticle.html page with pre-filled article data
app.get('/articles/edit', (req, res) => {
    const articleId = req.query.id;  // Get the article ID from the query parameter
    if (!articleId) {
        return res.status(400).json({ message: 'Article ID is required' });
    }

    // Get article data for the given article ID
    contentService.getPublishedArticles()
        .then(articles => {
            const article = articles.find(a => a.id === parseInt(articleId));
            if (article) {
                // Send article data to the edit page
                res.sendFile(path.join(__dirname, 'views', 'editArticle.html'), {
                    article: article // Passing the article to be pre-filled in the form
                });
            } else {
                res.status(404).json({ message: 'Article not found' });
            }
        })
        .catch(err => res.status(500).json({ message: err }));
});

// POST route to handle new article submission, including image upload
app.post('/articles/add', upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            return result;
        }

        upload(req).then((uploaded) => {
            processArticle(uploaded.url);
        }).catch(err => res.status(500).json({ message: "Image upload failed", error: err }));
    } else {
        processArticle("");
    }

    function processArticle(imageUrl) {
        req.body.featureImage = imageUrl;

        // Add article to content-service
        contentService.addArticle(req.body)
            .then(() => res.redirect('/api/articles'))
            .catch(err => res.status(500).json({ message: "Article creation failed", error: err }));
    }
});

// POST route to handle article update with image upload
app.post('/articles/edit', upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            return result;
        }

        upload(req).then((uploaded) => {
            updateArticle(uploaded.url);
        }).catch(err => res.status(500).json({ message: "Image upload failed", error: err }));
    } else {
        updateArticle("");
    }

    function updateArticle(imageUrl) {
        req.body.featureImage = imageUrl;

        // Update article in content-service
        contentService.updateArticle(req.body)
            .then(() => res.redirect('/api/articles'))
            .catch(err => res.status(500).json({ message: "Article update failed", error: err }));
    }
});

// Use the port provided by Vercel or fallback to 3003 if not defined
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
