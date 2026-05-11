const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REVIEWS_PATH = path.join(ROOT, 'data', 'myReviews.json');
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function todayDDMMYYYY() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function toCamelCase(name) {
  const ascii = String(name).normalize('NFD').replace(/[̀-ͯ]/g, '');
  const words = ascii.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  return words
    .map((w, i) => i === 0
      ? w.toLowerCase()
      : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '');
}

function saveWineImage(name, base64, ext) {
  const safeExt = (ext || 'png').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'png';
  const baseName = toCamelCase(name) || `wine${Date.now()}`;
  const dir = path.join(ROOT, 'images', 'wines');
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${baseName}.${safeExt}`;
  fs.writeFileSync(path.join(dir, filename), Buffer.from(base64, 'base64'));
  return `../../images/wines/${filename}`;
}

async function handleAddReview(req, res) {
  const raw = await readBody(req);
  const incoming = JSON.parse(raw);

  const reviews = JSON.parse(fs.readFileSync(REVIEWS_PATH, 'utf8'));
  const nextId = reviews.length === 0
    ? 1
    : Math.max(...reviews.map(r => Number(r.id) || 0)) + 1;

  const review = {
    id: nextId,
    name: String(incoming.name || '').trim(),
    grape: String(incoming.grape || '').trim(),
    color: String(incoming.color || '').trim(),
    price: String(incoming.price || '').trim(),
    year: incoming.year ? Number(incoming.year) : null,
    location: String(incoming.location || '').trim(),
    rating: Number(incoming.rating) || 0,
    date: todayDDMMYYYY(),
    description: String(incoming.description || '').trim(),
    keywords: Array.isArray(incoming.keywords)
      ? incoming.keywords
      : String(incoming.keywords || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
    img: incoming.img || '../../images/testwine.png',
  };

  if (!review.name) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'name is required' }));
    return;
  }

  if (incoming.imageData) {
    review.img = saveWineImage(review.name, incoming.imageData, incoming.imageExt);
  }

  reviews.push(review);
  fs.writeFileSync(REVIEWS_PATH, JSON.stringify(reviews, null, 2) + '\n');

  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(review));
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  if (urlPath === '/') {
    res.writeHead(302, { Location: '/src/html/homepage.html' });
    res.end();
    return;
  }

  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/reviews') {
      await handleAddReview(req, res);
      return;
    }
    if (req.method !== 'GET') {
      res.writeHead(405);
      res.end('Method not allowed');
      return;
    }
    serveStatic(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
});

server.listen(PORT, () => {
  console.log(`WineLover running at http://localhost:${PORT}/`);
});
