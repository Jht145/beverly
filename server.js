const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'beverly_heights_fallback_secret_2026';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const DB_FILE = path.join(__dirname, 'database.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database helper functions
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { content: {}, gallery: [], inquiries: [] };
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database.json:', err);
    return { content: {}, gallery: [], inquiries: [] };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing database.json:', err);
    return false;
  }
}

// JWT verification middleware
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Authorization: Bearer <token>
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden. Invalid token.' });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Unauthorized. Token required.' });
  }
}

// Multer storage configuration for gallery uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'gallery-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed (jpg, jpeg, png, webp, gif)'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Authentication Routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, username });
  }
  res.status(401).json({ error: 'Invalid username or password' });
});

app.get('/api/auth/verify', authenticateJWT, (req, res) => {
  res.json({ valid: true, username: req.user.username });
});

// Public Content Routes
app.get('/api/content', (req, res) => {
  const db = readDB();
  res.json(db.content);
});

app.post('/api/content', authenticateJWT, (req, res) => {
  const db = readDB();
  db.content = { ...db.content, ...req.body };
  if (writeDB(db)) {
    res.json({ message: 'Content updated successfully', content: db.content });
  } else {
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// Gallery Routes
app.get('/api/gallery', (req, res) => {
  const db = readDB();
  res.json(db.gallery || []);
});

app.post('/api/gallery/upload', authenticateJWT, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const db = readDB();
  const caption = req.body.caption || 'New Gallery Image';
  const category = req.body.category || 'general';
  
  const newPhoto = {
    id: Date.now().toString(),
    url: '/uploads/' + req.file.filename,
    caption: caption,
    category: category
  };

  db.gallery = db.gallery || [];
  db.gallery.push(newPhoto);

  if (writeDB(db)) {
    res.json({ message: 'Photo uploaded successfully', photo: newPhoto });
  } else {
    // Delete file if writing to database failed
    fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Failed to save photo metadata' });
  }
});

app.delete('/api/gallery/:id', authenticateJWT, (req, res) => {
  const photoId = req.params.id;
  const db = readDB();
  db.gallery = db.gallery || [];
  
  const photoIndex = db.gallery.findIndex(p => p.id === photoId);
  if (photoIndex === -1) {
    return res.status(404).json({ error: 'Photo not found' });
  }

  const photo = db.gallery[photoIndex];
  
  // If it's an uploaded file, delete it physically
  if (photo.url.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, 'public', photo.url);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error deleting physical file:', err);
      }
    }
  }

  db.gallery.splice(photoIndex, 1);

  if (writeDB(db)) {
    res.json({ message: 'Photo deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete photo from database' });
  }
});

// Customer Inquiry Routes
app.post('/api/inquiries', (req, res) => {
  const { name, email, phone, interestType, message } = req.body;
  if (!name || !phone || !interestType) {
    return res.status(400).json({ error: 'Name, phone, and interest type are required' });
  }

  const db = readDB();
  db.inquiries = db.inquiries || [];

  const newInquiry = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    name,
    email: email || '',
    phone,
    interestType,
    message: message || '',
    status: 'New'
  };

  db.inquiries.push(newInquiry);

  if (writeDB(db)) {
    res.status(201).json({ message: 'Inquiry submitted successfully', inquiry: newInquiry });
  } else {
    res.status(500).json({ error: 'Failed to save inquiry' });
  }
});

app.get('/api/inquiries', authenticateJWT, (req, res) => {
  const db = readDB();
  res.json(db.inquiries || []);
});

app.delete('/api/inquiries/:id', authenticateJWT, (req, res) => {
  const inquiryId = req.params.id;
  const db = readDB();
  db.inquiries = db.inquiries || [];
  
  const inquiryIndex = db.inquiries.findIndex(i => i.id === inquiryId);
  if (inquiryIndex === -1) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }

  db.inquiries.splice(inquiryIndex, 1);

  if (writeDB(db)) {
    res.json({ message: 'Inquiry deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete inquiry from database' });
  }
});

// Catch-all route to serve the public website files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Beverly Heights Server running on port ${PORT} `);
  console.log(` Web Site: http://localhost:${PORT} `);
  console.log(` Admin Portal: http://localhost:${PORT}/admin.html `);
  console.log(`==================================================`);
});
