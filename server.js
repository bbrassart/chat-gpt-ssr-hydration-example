// server.js
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import express from 'express';
import App from './App';
import axios from 'axios';
import LRU from 'lru-cache';

const app = express();

// Create a cache with a maximum of 500 entries and a maximum age of 5 minutes
const cache = new LRU({ max: 500, maxAge: 5 * 60 * 1000 });

app.get('/', async (req, res) => {
  try {
    // Check if the rendered output is in the cache
    const cachedHtml = cache.get(req.url);
    if (cachedHtml) {
      console.log('Serving cached output for:', req.url);
      return res.send(cachedHtml);
    }

    // Fetch data from API endpoint
    const { data } = await axios.get('https://example.com/api/data');

    // Render the App component to HTML with fetched data
    const appHtml = ReactDOMServer.renderToString(<App data={data} />);

    // Cache the rendered output for future requests
    cache.set(req.url, appHtml);

    // Send the HTML back to the client
    res.send(`
      <!doctype html>
      <html>
        <head>
          <title>My App</title>
        </head>
        <body>
          <div id="app">${appHtml}</div>
          <script>
            window.__INITIAL_DATA__ = ${JSON.stringify(data)}
          </script>
          <script src="/client.js"></script>
        </body>
      </html>
    `);
  } catch (error) {
    // Handle errors
    res.status(500).send('Error fetching data');
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
