const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000; // Change the port number if needed

// Define a route for your scraping API
app.get('/api/scrape', async (req, res) => {
  try {
    // Extract search query parameters from the request
    const trackName = req.query.trackName;
    const artistName = req.query.artistName;

    // Launch a new browser instance in headful mode
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the website
    const websiteUrl = 'https://wynk.in/music/search';
    await page.goto(websiteUrl);

    // Wait for the search input to be available
    const searchInputSelector = 'input';
    await page.click(searchInputSelector);
    await page.waitForSelector(searchInputSelector);

    // Type the search query into the search input
    await page.type(searchInputSelector, trackName + ' ' + artistName);

    await page.waitForSelector('[data-testid="searchResultItem"]');
    const trackLinks = await page.$$eval('[data-testid="searchResultItem"] a', (links) => links.map((link) => decodeURIComponent(link.href)));
    await browser.close();

    // Send back the result as JSON
    res.json({ message: 'Scraping successful', data: trackLinks[0] });
  } catch (error) {
    // If an error occurs during scraping, send an error response
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
