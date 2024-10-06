// Your Name: Syed Faizan Mehdi Zaidi
// Your Student Number: 136151230
// Your Email Address: Sfmzaidi@myseneca.ca

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

// Export the functions for use in index.js
module.exports = {
    initialize,
    getPublishedArticles,
    getCategories
};
