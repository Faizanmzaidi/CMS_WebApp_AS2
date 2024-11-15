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

// Route to serve the addArticle.html file
app.get('/articles/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addArticle.html'));
});

// Route to serve the editArticle.html page with pre-filled article data
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
                // Send the editArticle.html file and inject the article data as a JavaScript object
                res.sendFile(path.join(__dirname, 'views', 'editArticle.html'), (err, html) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error serving the edit article page' });
                    }

                    // Inject the article data into the HTML using a <script> tag
                    html = html.replace(
                        '</body>',
                        `<script>
                            window.article = ${JSON.stringify(article)};
                        </script></body>`
                    );

                    res.send(html); // Send the modified HTML back to the client
                });
            } else {
                res.status(404).json({ message: 'Article not found' });
            }
        })
        .catch(err => res.status(500).json({ message: err }));
});

// POST route to handle new article submission, including image upload
app.post('/articles/add', upload.single("featureImage"), (req, res) => {
    console.log('Received form data:', req.body); // Log the form data for debugging

    if (req.file) {
        console.log('Received file:', req.file); // Log the file data for debugging

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
        processArticle(""); // No image uploaded, proceed with empty image URL
    }

    function processArticle(imageUrl) {
        req.body.featureImage = imageUrl;

        // Add article to content-service
        contentService.addArticle(req.body)
            .then(() => {
                res.redirect('/api/articles');  // Redirect to articles list after creation
            })
            .catch(err => res.status(500).json({ message: "Article creation failed", error: err }));
    }
});

// POST route to handle article update with image upload
app.post('/articles/edit', upload.single("featureImage"), (req, res) => {
    console.log('Received form data for editing:', req.body); // Log the form data for debugging

    if (req.file) {
        console.log('Received file for editing:', req.file); // Log the file data for debugging

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
        updateArticle(""); // No image uploaded, proceed with empty image URL
    }

    function updateArticle(imageUrl) {
        req.body.featureImage = imageUrl;

        // Update article in content-service
        contentService.updateArticle(req.body.id, req.body) // Ensure you're passing the correct data
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
