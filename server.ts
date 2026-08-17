import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Data directory and file for persistent storage
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'galleries.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache + file storage helper
function loadGalleries(): any[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading galleries file:', err);
  }
  return [];
}

function saveGalleries(galleries: any[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(galleries, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing galleries file:', err);
  }
}

// Memory copy initialized from disk
let galleriesStore = loadGalleries();

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', count: galleriesStore.length });
});

// GET all galleries (Admin Dashboard)
app.get('/api/galleries', (req, res) => {
  res.json(galleriesStore);
});

// GET single gallery by ID (Client Link & Direct Access)
app.get('/api/galleries/:id', (req, res) => {
  const { id } = req.params;
  const gallery = galleriesStore.find((g: any) => g.id === id);
  if (!gallery) {
    return res.status(404).json({ error: 'Gallery not found' });
  }
  res.json(gallery);
});

// POST save/publish gallery
app.post('/api/galleries', (req, res) => {
  const gallery = req.body;
  if (!gallery || !gallery.id || !gallery.title) {
    return res.status(400).json({ error: 'Invalid gallery payload' });
  }

  const existingIndex = galleriesStore.findIndex((g: any) => g.id === gallery.id);
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    galleriesStore[existingIndex] = {
      ...galleriesStore[existingIndex],
      ...gallery,
      updatedAt: now,
    };
  } else {
    galleriesStore.unshift({
      ...gallery,
      createdAt: gallery.createdAt || now,
      updatedAt: now,
    });
  }

  saveGalleries(galleriesStore);
  res.json({ success: true, gallery: galleriesStore.find((g: any) => g.id === gallery.id) });
});

// DELETE gallery
app.delete('/api/galleries/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = galleriesStore.length;
  galleriesStore = galleriesStore.filter((g: any) => g.id !== id);
  
  if (galleriesStore.length !== initialLength) {
    saveGalleries(galleriesStore);
    res.json({ success: true, message: 'Gallery deleted' });
  } else {
    res.status(404).json({ error: 'Gallery not found' });
  }
});

// ================= VITE INTEGRATION =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
