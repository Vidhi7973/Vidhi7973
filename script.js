const uploadArea   = document.getElementById('uploadArea');
const fileInput    = document.getElementById('fileInput');
const gallery      = document.getElementById('gallery');
const imageGrid    = document.getElementById('imageGrid');
const imageCount   = document.getElementById('imageCount');
const clearAllBtn  = document.getElementById('clearAllBtn');

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_SIZE_MB    = 10;

/* ── Drag-and-drop events ─────────────────────────────────────── */
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('drag-over');
});

['dragleave', 'dragend'].forEach((evt) =>
  uploadArea.addEventListener(evt, () => uploadArea.classList.remove('drag-over'))
);

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  handleFiles(e.dataTransfer.files);
});

/* ── Click-to-browse ──────────────────────────────────────────── */
uploadArea.addEventListener('click', (e) => {
  if (e.target !== fileInput) fileInput.click();
});

fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files);
  fileInput.value = '';          // reset so same file can be re-selected
});

/* ── Clear all ────────────────────────────────────────────────── */
clearAllBtn.addEventListener('click', () => {
  imageGrid.innerHTML = '';
  updateCount();
});

/* ── Core logic ───────────────────────────────────────────────── */
function handleFiles(files) {
  Array.from(files).forEach((file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      showToast(`"${file.name}" is not a supported image type.`);
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showToast(`"${file.name}" exceeds the ${MAX_SIZE_MB} MB limit.`);
      return;
    }
    renderCard(file);
  });
  updateCount();
}

function renderCard(file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    const card = document.createElement('div');
    card.className = 'image-card';

    const img = document.createElement('img');
    img.src = e.target.result;
    img.alt = file.name;

    const info = document.createElement('div');
    info.className = 'card-info';

    const name = document.createElement('p');
    name.className = 'file-name';
    name.textContent = file.name;
    name.title = file.name;

    const meta = document.createElement('p');
    meta.className = 'file-meta';
    meta.textContent = `${formatSize(file.size)} · ${file.type.split('/')[1].toUpperCase()}`;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '✕';
    removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
    removeBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      card.remove();
      updateCount();
    });

    info.appendChild(name);
    info.appendChild(meta);
    card.appendChild(img);
    card.appendChild(info);
    card.appendChild(removeBtn);
    imageGrid.appendChild(card);
  };

  reader.readAsDataURL(file);
}

/* ── Helpers ──────────────────────────────────────────────────── */
function updateCount() {
  const count = imageGrid.children.length;
  imageCount.textContent = count;
  gallery.hidden = count === 0;
}

function formatSize(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Toast notification ───────────────────────────────────────── */
let toastTimer;
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}
