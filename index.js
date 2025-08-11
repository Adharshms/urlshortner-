require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory storage
let urls = [];
let counter = 1;

// POST endpoint
app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;
  try {
    const hostname = new URL(original_url).hostname;
    dns.lookup(hostname, (err) => {
      if (err) return res.json({ error: 'invalid url' });

      urls.push({ original_url, short_url: counter });
      res.json({ original_url, short_url: counter });
      counter++;
    });
  } catch {
    res.json({ error: 'invalid url' });
  }
});

// GET endpoint
app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url = parseInt(req.params.short_url);
  const found = urls.find(u => u.short_url === short_url);
  if (found) {
    res.redirect(found.original_url);
  } else {
    res.json({ error: 'No short URL found' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
