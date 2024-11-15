//  Name: Syed Faizan Mehdi Zaidi
//  Student Number: 136151230
//  Email Address: Sfmzaidi@myseneca.ca

const fs = require('fs').promises; // Use promises to handle file reading
const path = require('path'); // Import the path module

let articles = [];
let categories = [];

/**
 * Initializes the content service by loading articles and categories data.
 * @returns {Promise} A promise that resolves when both data sets are loaded.
 */
function initialize() {
    return Promise.all([
        fs.readFile(path.join(__dirname, 'data', 'articles.json'), 'utf8') // Updated path
            .then(data => {
                articles = JSON.parse(data);
            })
            .catch(err => {
                return Promise.reject('Unable to read articles file: ' + err.message);
            }),
        fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8') // Updated path
            .then(data => {
                categories = JSON.parse(data);
            })
            .catch(err => {
                return Promise.reject('Unable to read categories file: ' + err.message);
            })
    ]);
}

/**
 * Returns only published articles.
 * @returns {Promise} A promise that resolves with published articles.
 */
function getPublishedArticles() {
    return new Promise((resolve, reject) => {
        const publishedArticles = articles.filter(article => article.published);
        if (publishedArticles.length > 0) {
            resolve(publishedArticles);
        } else {
            reject('No published articles found.');
        }
    });
}

/**
 * Returns all categories.
 * @returns {Promise} A promise that resolves with all categories.
 */
function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject('No categories found.');
        }
    });
}

/**
 * Adds a new article to the articles list and saves it.
 * @param {Object} article - The article data to be added.
 * @returns {Promise} A promise that resolves with the newly added article.
 */
function addArticle(article) {
    return new Promise((resolve, reject) => {
        // Assuming article has 'title', 'content', 'category', 'published', and 'featureImage' properties
        const newArticle = { 
            id: articles.length + 1, 
            title: article.title, 
            content: article.content, 
            category: article.category, 
            published: article.published || false,
            featureImage: article.featureImage || '' // Save the image URL if present
        };

        // Add the new article to the array
        articles.push(newArticle);

        // Save the updated articles to the file
        fs.writeFile(path.join(__dirname, 'data', 'articles.json'), JSON.stringify(articles, null, 2))
            .then(() => resolve(newArticle))
            .catch(err => reject('Error saving the article: ' + err.message));
    });
}

/**
 * Updates an existing article with new data.
 * @param {number} articleId - The ID of the article to be updated.
 * @param {Object} updatedData - The new data to update the article with.
 * @returns {Promise} A promise that resolves with the updated article, or rejects if not found.
 */
function updateArticle(articleId, updatedData) {
    return new Promise((resolve, reject) => {
        // Find the article by ID
        const articleIndex = articles.findIndex(article => article.id === articleId);
        
        if (articleIndex === -1) {
            return reject('Article not found');
        }

        // Update the article properties
        articles[articleIndex] = { 
            ...articles[articleIndex],
            ...updatedData  // Merge the updated data
        };

        // Save the updated articles to the file
        fs.writeFile(path.join(__dirname, 'data', 'articles.json'), JSON.stringify(articles, null, 2))
            .then(() => resolve(articles[articleIndex]))
            .catch(err => reject('Error updating the article: ' + err.message));
    });
}

// Export the functions for use in index.js
module.exports = {
    initialize,
    getPublishedArticles,
    getCategories,
    addArticle,
    updateArticle // Export the new updateArticle function
};
