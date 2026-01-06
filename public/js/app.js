// ============================================
// School File Vault - Application Logic
// ============================================

// State
let currentView = 'all';
let currentSubject = null;
let allFiles = [];
let subjects = [];
let selectedFiles = [];

// DOM Elements
const filesGrid = document.getElementById('files-grid');
const subjectsList = document.getElementById('subjects-list');
const searchInput = document.getElementById('search-input');
const searchInputMobile = document.getElementById('search-input-mobile');
const uploadModal = document.getElementById('upload-modal');
const previewModal = document.getElementById('preview-modal');
const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const dropArea = document.getElementById('drop-area');
const modalDropArea = document.getElementById('modal-drop-area');
const emptyState = document.getElementById('empty-state');
const loadingState = document.getElementById('loading-state');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');
const storageCount = document.getElementById('storage-count');
const storageBar = document.getElementById('storage-bar');

// Subject icons and colors
const subjectConfig = {
  mathematics: { icon: '📐', color: 'bg-subject-math', label: 'Mathematics' },
  science: { icon: '🔬', color: 'bg-subject-science', label: 'Science' },
  history: { icon: '📜', color: 'bg-subject-history', label: 'History' },
  literature: { icon: '📚', color: 'bg-subject-literature', label: 'Literature' },
  languages: { icon: '🌍', color: 'bg-subject-languages', label: 'Languages' },
  'computer-science': { icon: '💻', color: 'bg-subject-cs', label: 'Computer Science' },
  arts: { icon: '🎨', color: 'bg-subject-arts', label: 'Arts' },
  other: { icon: '📁', color: 'bg-subject-other', label: 'Other' },
};

// File type icons
const fileTypeIcons = {
  pdf: '<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none"><path d="M7 18H17V16H7V18ZM7 14H17V12H7V14ZM7 10H11V8H7V10ZM5 22C4.45 22 3.979 21.804 3.587 21.413C3.196 21.021 3 20.55 3 20V4C3 3.45 3.196 2.979 3.587 2.587C3.979 2.196 4.45 2 5 2H13L19 8V20C19 20.55 18.804 21.021 18.413 21.413C18.021 21.804 17.55 22 17 22H5ZM12 9V4H5V20H17V9H12Z" fill="#FF3B30"/></svg>',
  document: '<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none"><path d="M7 18H17V16H7V18ZM7 14H17V12H7V14ZM7 10H11V8H7V10ZM5 22C4.45 22 3.979 21.804 3.587 21.413C3.196 21.021 3 20.55 3 20V4C3 3.45 3.196 2.979 3.587 2.587C3.979 2.196 4.45 2 5 2H13L19 8V20C19 20.55 18.804 21.021 18.413 21.413C18.021 21.804 17.55 22 17 22H5ZM12 9V4H5V20H17V9H12Z" fill="#007AFF"/></svg>',
  spreadsheet: '<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none"><path d="M3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5ZM9 7V11H5V7H9ZM9 13V17H5V13H9ZM11 7H15V11H11V7ZM15 13V17H11V13H15ZM19 7V11H17V7H19ZM19 13V17H17V13H19Z" fill="#34C759"/></svg>',
  presentation: '<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none"><path d="M5 3C3.9 3 3 3.9 3 5V17C3 18.1 3.9 19 5 19H9V21H7V23H17V21H15V19H19C20.1 19 21 18.1 21 17V5C21 3.9 20.1 3 19 3H5ZM5 5H19V17H5V5ZM12 6L8 14H10L10.5 12.5H13.5L14 14H16L12 6ZM12 8.25L13 11H11L12 8.25Z" fill="#FF9500"/></svg>',
  image: '<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none"><path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14.14 11.86L11.14 15.73L9 13.14L6 17H18L14.14 11.86Z" fill="#AF52DE"/></svg>',
  text: '<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none"><path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="#5AC8FA"/></svg>',
  other: '<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none"><path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM13 9V3.5L18.5 9H13Z" fill="#8E8E93"/></svg>',
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', init);

async function init() {
  setupEventListeners();
  setupDragAndDrop();
  await loadSubjects();
  await loadFiles();
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
  // Navigation items
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => handleViewChange(btn.dataset.view));
  });

  // Search
  searchInput?.addEventListener('input', debounce(handleSearch, 300));
  searchInputMobile?.addEventListener('input', debounce(handleSearch, 300));

  // File input
  fileInput?.addEventListener('change', handleFileSelect);

  // Modal drop area click
  modalDropArea?.addEventListener('click', () => fileInput.click());

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideUploadModal();
      hidePreviewModal();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput?.focus();
    }
  });
}

// ============================================
// Drag and Drop
// ============================================

function setupDragAndDrop() {
  // Global drag events
  let dragCounter = 0;

  document.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    if (dragCounter === 1) {
      dropZone.classList.remove('hidden');
    }
  });

  document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter === 0) {
      dropZone.classList.add('hidden');
    }
  });

  document.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  document.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    dropZone.classList.add('hidden');
    handleDrop(e.dataTransfer.files);
  });

  // Drop area specific
  setupDropArea(dropArea);
  setupDropArea(modalDropArea);
}

function setupDropArea(area) {
  if (!area) return;

  area.addEventListener('dragenter', (e) => {
    e.preventDefault();
    area.classList.add('drag-over');
  });

  area.addEventListener('dragleave', (e) => {
    e.preventDefault();
    area.classList.remove('drag-over');
  });

  area.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  area.addEventListener('drop', (e) => {
    e.preventDefault();
    area.classList.remove('drag-over');
  });
}

// ============================================
// API Functions
// ============================================

async function loadSubjects() {
  try {
    const response = await fetch('/api/subjects');
    subjects = await response.json();
    renderSubjects();
  } catch (error) {
    console.error('Error loading subjects:', error);
  }
}

async function loadFiles(view = currentView, subject = currentSubject) {
  showLoading();
  
  try {
    let url = '/api/files';
    if (view === 'recent') {
      url = '/api/recent';
    } else if (subject) {
      url = `/api/files/subject/${subject}`;
    }

    const response = await fetch(url);
    allFiles = await response.json();
    renderFiles();
    updateStorageInfo();
  } catch (error) {
    console.error('Error loading files:', error);
    showToast('Error loading files', 'error');
  } finally {
    hideLoading();
  }
}

async function searchFiles(query) {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    allFiles = await response.json();
    renderFiles();
  } catch (error) {
    console.error('Error searching files:', error);
  }
}

async function deleteFile(id) {
  try {
    const response = await fetch(`/api/files/${id}`, { method: 'DELETE' });
    if (response.ok) {
      showToast('File deleted successfully');
      hidePreviewModal();
      await loadSubjects();
      await loadFiles();
    } else {
      throw new Error('Failed to delete');
    }
  } catch (error) {
    showToast('Error deleting file', 'error');
  }
}

// ============================================
// File Handling
// ============================================

function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  if (files.length > 0) {
    selectedFiles = files;
    renderSelectedFiles();
  }
}

function handleDrop(files) {
  selectedFiles = Array.from(files);
  showUploadModal();
  renderSelectedFiles();
}

function renderSelectedFiles() {
  const container = document.getElementById('selected-files');
  const list = document.getElementById('files-list');
  const uploadBtn = document.getElementById('upload-btn');

  if (selectedFiles.length === 0) {
    container.classList.add('hidden');
    uploadBtn.disabled = true;
    return;
  }

  container.classList.remove('hidden');
  uploadBtn.disabled = false;

  list.innerHTML = selectedFiles.map((file, index) => `
    <div class="flex items-center justify-between p-2 bg-apple-bg rounded-apple">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-lg">${getFileEmoji(file.name)}</span>
        <span class="text-sm text-apple-text truncate">${file.name}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-apple-secondary">${formatFileSize(file.size)}</span>
        <button onclick="removeSelectedFile(${index})" class="p-1 hover:bg-white rounded transition-colors">
          <svg class="w-4 h-4 text-apple-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

function removeSelectedFile(index) {
  selectedFiles.splice(index, 1);
  renderSelectedFiles();
}

async function uploadFiles() {
  if (selectedFiles.length === 0) return;

  const formData = new FormData();
  const subjectSelect = document.getElementById('subject-select');
  const subject = subjectSelect.value;

  selectedFiles.forEach(file => {
    formData.append('files', file);
  });

  if (subject) {
    formData.append('subject', subject);
  }

  showUploadProgress();

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      showToast(`${result.files.length} file(s) uploaded successfully`);
      hideUploadModal();
      selectedFiles = [];
      await loadSubjects();
      await loadFiles();
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
    showToast('Error uploading files', 'error');
  } finally {
    hideUploadProgress();
  }
}

// ============================================
// Rendering
// ============================================

function renderSubjects() {
  subjectsList.innerHTML = subjects.map(subject => {
    const config = subjectConfig[subject.name] || subjectConfig.other;
    const isActive = currentSubject === subject.name;
    
    return `
      <li>
        <button 
          class="nav-item w-full text-left ${isActive ? 'active' : ''}" 
          data-subject="${subject.name}"
          onclick="handleSubjectClick('${subject.name}')"
        >
          <span class="text-lg">${config.icon}</span>
          <span class="flex-1">${config.label}</span>
          ${subject.count > 0 ? `<span class="text-xs text-apple-secondary bg-apple-bg px-2 py-0.5 rounded-full">${subject.count}</span>` : ''}
        </button>
      </li>
    `;
  }).join('');
}

function renderFiles() {
  if (allFiles.length === 0) {
    filesGrid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  filesGrid.classList.remove('hidden');
  emptyState.classList.add('hidden');

  filesGrid.innerHTML = allFiles.map((file, index) => {
    const config = subjectConfig[file.subject] || subjectConfig.other;
    const typeIcon = fileTypeIcons[file.type] || fileTypeIcons.other;

    return `
      <div 
        class="file-card animate-fade-in" 
        style="animation-delay: ${index * 50}ms"
        onclick="openFilePreview('${file.id}')"
      >
        <div class="relative mb-3">
          <div class="h-32 bg-gradient-to-br from-apple-bg to-white rounded-apple flex items-center justify-center">
            ${file.type === 'image' ? 
              `<img src="${file.path}" alt="${file.name}" class="w-full h-full object-cover rounded-apple">` :
              typeIcon
            }
          </div>
          <div class="absolute top-2 right-2 subject-icon w-8 h-8 text-sm ${config.color}/20 backdrop-blur-sm">
            ${config.icon}
          </div>
        </div>
        <h4 class="font-medium text-apple-text text-sm truncate mb-1" title="${file.name}">${file.name}</h4>
        <div class="flex items-center justify-between text-xs text-apple-secondary">
          <span>${formatFileSize(file.size)}</span>
          <span>${formatDate(file.uploadedAt)}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// View Management
// ============================================

function handleViewChange(view) {
  currentView = view;
  currentSubject = null;

  // Update nav active state
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  document.querySelectorAll('[data-subject]').forEach(btn => {
    btn.classList.remove('active');
  });

  // Update title
  if (view === 'all') {
    pageTitle.textContent = 'All Files';
    pageSubtitle.textContent = 'Manage your study materials';
  } else if (view === 'recent') {
    pageTitle.textContent = 'Recent Files';
    pageSubtitle.textContent = 'Recently accessed materials';
  }

  loadFiles(view);
  closeSidebarOnMobile();
}

function handleSubjectClick(subject) {
  currentView = 'subject';
  currentSubject = subject;

  // Update nav active state
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('[data-subject]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.subject === subject);
  });

  // Update title
  const config = subjectConfig[subject] || subjectConfig.other;
  pageTitle.textContent = `${config.icon} ${config.label}`;
  pageSubtitle.textContent = `${subject} study materials`;

  loadFiles('subject', subject);
  closeSidebarOnMobile();
}

// ============================================
// Search
// ============================================

function handleSearch(e) {
  const query = e.target.value.trim();
  
  // Sync both search inputs
  if (e.target === searchInput && searchInputMobile) {
    searchInputMobile.value = query;
  } else if (e.target === searchInputMobile && searchInput) {
    searchInput.value = query;
  }

  if (query.length === 0) {
    loadFiles();
    return;
  }

  if (query.length >= 2) {
    searchFiles(query);
    pageTitle.textContent = `Search: "${query}"`;
    pageSubtitle.textContent = 'Search results';
  }
}

// ============================================
// File Preview
// ============================================

function openFilePreview(fileId) {
  const file = allFiles.find(f => f.id === fileId);
  if (!file) return;

  const config = subjectConfig[file.subject] || subjectConfig.other;
  
  document.getElementById('preview-icon').innerHTML = config.icon;
  document.getElementById('preview-icon').className = `subject-icon ${config.color}/20`;
  document.getElementById('preview-title').textContent = file.name;
  document.getElementById('preview-meta').textContent = `${formatFileSize(file.size)} • ${formatDate(file.uploadedAt)}`;
  document.getElementById('preview-download').href = file.path;
  document.getElementById('preview-download').download = file.name;
  document.getElementById('preview-delete').onclick = () => {
    if (confirm('Are you sure you want to delete this file?')) {
      deleteFile(file.id);
    }
  };

  // Preview content based on type
  const previewContent = document.getElementById('preview-content');
  
  if (file.type === 'image') {
    previewContent.innerHTML = `
      <div class="flex items-center justify-center h-full">
        <img src="${file.path}" alt="${file.name}" class="max-w-full max-h-full object-contain rounded-apple shadow-apple">
      </div>
    `;
  } else if (file.type === 'pdf') {
    previewContent.innerHTML = `
      <iframe src="${file.path}" class="w-full h-full rounded-apple" frameborder="0"></iframe>
    `;
  } else {
    previewContent.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-center">
        <div class="w-24 h-24 bg-white rounded-apple-lg shadow-apple flex items-center justify-center mb-4">
          ${fileTypeIcons[file.type] || fileTypeIcons.other}
        </div>
        <h4 class="font-medium text-apple-text mb-2">${file.name}</h4>
        <p class="text-sm text-apple-secondary mb-4">Preview not available for this file type</p>
        <a href="${file.path}" download="${file.name}" class="btn-primary">
          Download File
        </a>
      </div>
    `;
  }

  previewModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Update last accessed
  fetch(`/api/files/${file.id}/access`, { method: 'PUT' });
}

function hidePreviewModal() {
  previewModal.classList.add('hidden');
  document.body.style.overflow = '';
}

// ============================================
// Modal Management
// ============================================

function showUploadModal() {
  uploadModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function hideUploadModal() {
  uploadModal.classList.add('hidden');
  document.body.style.overflow = '';
  selectedFiles = [];
  fileInput.value = '';
  document.getElementById('selected-files').classList.add('hidden');
  document.getElementById('upload-btn').disabled = true;
  document.getElementById('subject-select').value = '';
  hideUploadProgress();
}

function showUploadProgress() {
  document.getElementById('upload-progress').classList.remove('hidden');
  document.getElementById('upload-btn').disabled = true;
  
  // Simulate progress
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 30;
    if (progress > 90) progress = 90;
    updateProgress(progress);
  }, 200);

  // Store interval for cleanup
  window.uploadInterval = interval;
}

function hideUploadProgress() {
  if (window.uploadInterval) {
    clearInterval(window.uploadInterval);
  }
  updateProgress(100);
  setTimeout(() => {
    document.getElementById('upload-progress').classList.add('hidden');
    updateProgress(0);
  }, 300);
}

function updateProgress(percent) {
  document.getElementById('progress-bar').style.width = `${percent}%`;
  document.getElementById('progress-percent').textContent = `${Math.round(percent)}%`;
}

// ============================================
// Sidebar
// ============================================

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  sidebar.classList.toggle('-translate-x-full');
  overlay.classList.toggle('hidden');
}

function closeSidebarOnMobile() {
  if (window.innerWidth < 1024) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
  }
}

// ============================================
// UI Helpers
// ============================================

function showLoading() {
  loadingState.classList.remove('hidden');
  filesGrid.classList.add('hidden');
  emptyState.classList.add('hidden');
}

function hideLoading() {
  loadingState.classList.add('hidden');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastIcon = document.getElementById('toast-icon');
  const toastMessage = document.getElementById('toast-message');

  toastIcon.textContent = type === 'success' ? '✓' : '✕';
  toastMessage.textContent = message;
  
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function updateStorageInfo() {
  const totalFiles = allFiles.length;
  storageCount.textContent = `${totalFiles} file${totalFiles !== 1 ? 's' : ''}`;
  
  // Simulate storage usage (max 100 files for visual)
  const usage = Math.min((totalFiles / 100) * 100, 100);
  storageBar.style.width = `${Math.max(usage, 3)}%`;
}

// ============================================
// Utility Functions
// ============================================

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getFileEmoji(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const emojis = {
    pdf: '📄',
    doc: '📝', docx: '📝',
    xls: '📊', xlsx: '📊',
    ppt: '📊', pptx: '📊',
    txt: '📃', md: '📃',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
    zip: '📦', rar: '📦',
  };
  return emojis[ext] || '📄';
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
