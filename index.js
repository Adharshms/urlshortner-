require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const urlParser = require('url');

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let urlDatabase = {}; // In-memory store
let idCounter = 1;

// Home page
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

// POST to create short URL
app.post('/api/shorturl', (req, res) => {
  const inputUrl = req.body.url;

  // Validate URL format
  try {
    const parsedUrl = new URL(inputUrl);
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      // Store in memory
      const shortUrl = idCounter++;
      urlDatabase[shortUrl] = inputUrl;

      res.json({
        original_url: inputUrl,
        short_url: shortUrl
      });
    });
  } catch (e) {
    res.json({ error: 'invalid url' });
  }
});

// GET to redirect
app.get('/api/shorturl/:short', (req, res) => {
  const short = req.params.short;
  const original = urlDatabase[short];

  if (original) {
    res.redirect(original);
  } else {
    res.json({ error: 'No short URL found' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
