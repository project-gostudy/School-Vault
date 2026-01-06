const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const uploadsDir = path.join(__dirname, '../../uploads');
const dataDir = path.join(__dirname, '../../data');
const dataFile = path.join(dataDir, 'files.json');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify([], null, 2));

// Subject detection keywords
const subjectKeywords = {
  mathematics: ['math', 'algebra', 'calculus', 'geometry', 'trigonometry', 'statistics', 'equation'],
  science: ['science', 'biology', 'chemistry', 'physics', 'lab', 'experiment', 'molecule'],
  history: ['history', 'war', 'revolution', 'ancient', 'medieval', 'century', 'civilization'],
  literature: ['literature', 'essay', 'novel', 'poetry', 'shakespeare', 'writing', 'book'],
  languages: ['language', 'spanish', 'french', 'german', 'italian', 'vocabulary', 'grammar'],
  'computer-science': ['programming', 'code', 'algorithm', 'computer', 'software', 'python', 'javascript'],
  arts: ['art', 'music', 'drawing', 'painting', 'design', 'creative', 'sculpture'],
};

// Detect subject from filename
function detectSubject(filename) {
  const lowerName = filename.toLowerCase();
  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return subject;
    }
  }
  return 'other';
}

// Get file type category
function getFileType(mimetype) {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.includes('pdf')) return 'pdf';
  if (mimetype.includes('word') || mimetype.includes('document')) return 'document';
  if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'presentation';
  if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return 'spreadsheet';
  if (mimetype.startsWith('text/')) return 'text';
  return 'other';
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Accept common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

// Helper to read/write files data
function readFilesData() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch {
    return [];
  }
}

function writeFilesData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// GET /api/files - Get all files
router.get('/files', (req, res) => {
  const files = readFilesData();
  res.json(files);
});

// GET /api/files/subject/:subject - Get files by subject
router.get('/files/subject/:subject', (req, res) => {
  const files = readFilesData();
  const filtered = files.filter(f => f.subject === req.params.subject);
  res.json(filtered);
});

// GET /api/subjects - Get all subjects with counts
router.get('/subjects', (req, res) => {
  const files = readFilesData();
  const subjects = {};
  
  // Initialize all subjects
  const allSubjects = ['mathematics', 'science', 'history', 'literature', 'languages', 'computer-science', 'arts', 'other'];
  allSubjects.forEach(s => {
    subjects[s] = { name: s, count: 0, icon: getSubjectIcon(s), color: getSubjectColor(s) };
  });
  
  // Count files per subject
  files.forEach(f => {
    if (subjects[f.subject]) {
      subjects[f.subject].count++;
    }
  });
  
  res.json(Object.values(subjects));
});

function getSubjectIcon(subject) {
  const icons = {
    mathematics: '📐',
    science: '🔬',
    history: '📜',
    literature: '📚',
    languages: '🌍',
    'computer-science': '💻',
    arts: '🎨',
    other: '📁',
  };
  return icons[subject] || '📁';
}

function getSubjectColor(subject) {
  const colors = {
    mathematics: 'math',
    science: 'science',
    history: 'history',
    literature: 'literature',
    languages: 'languages',
    'computer-science': 'cs',
    arts: 'arts',
    other: 'other',
  };
  return colors[subject] || 'other';
}

// GET /api/recent - Get recent files
router.get('/recent', (req, res) => {
  const files = readFilesData();
  const recent = files
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .slice(0, 10);
  res.json(recent);
});

// POST /api/upload - Upload files
router.post('/upload', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const files = readFilesData();
  const uploadedFiles = [];

  req.files.forEach(file => {
    const subject = req.body.subject || detectSubject(file.originalname);
    const fileData = {
      id: uuidv4(),
      name: file.originalname,
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      type: getFileType(file.mimetype),
      subject: subject,
      uploadedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
    };
    files.push(fileData);
    uploadedFiles.push(fileData);
  });

  writeFilesData(files);
  res.json({ success: true, files: uploadedFiles });
});

// DELETE /api/files/:id - Delete a file
router.delete('/files/:id', (req, res) => {
  let files = readFilesData();
  const fileIndex = files.findIndex(f => f.id === req.params.id);
  
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }

  const file = files[fileIndex];
  
  // Delete physical file
  const filePath = path.join(uploadsDir, file.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Remove from data
  files.splice(fileIndex, 1);
  writeFilesData(files);
  
  res.json({ success: true });
});

// PUT /api/files/:id/access - Update last accessed time
router.put('/files/:id/access', (req, res) => {
  const files = readFilesData();
  const file = files.find(f => f.id === req.params.id);
  
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  file.lastAccessedAt = new Date().toISOString();
  writeFilesData(files);
  
  res.json(file);
});

// GET /api/search - Search files
router.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json([]);
  }

  const files = readFilesData();
  const query = q.toLowerCase();
  const results = files.filter(f => 
    f.name.toLowerCase().includes(query) ||
    f.subject.toLowerCase().includes(query)
  );
  
  res.json(results);
});

module.exports = router;
