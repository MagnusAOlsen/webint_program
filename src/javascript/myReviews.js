function convertDate(dateString) {
  const [day, month, year] = dateString.split('.');
  return new Date(`${year}-${month}-${day}`);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

let allReviews = [];
let activeFilter = null;

function applyFilter(reviews, c) {
  if (!c) return reviews;
  const lc = s => (s ?? '').toString().toLowerCase();
  return reviews.filter(r => {
    if (c.name && !lc(r.name).includes(lc(c.name))) return false;
    if (c.grape && !lc(r.grape).includes(lc(c.grape))) return false;
    if (c.color && lc(r.color) !== lc(c.color)) return false;
    if (c.price && !lc(r.price).includes(lc(c.price))) return false;
    if (c.location && !lc(r.location).includes(lc(c.location))) return false;
    if (c.year && Number(r.year) !== Number(c.year)) return false;
    if (c.rating && Number(r.rating) !== Number(c.rating)) return false;
    if (c.keywords) {
      const hay = (r.keywords || []).join(' ').toLowerCase() + ' ' + lc(r.description);
      if (!hay.includes(lc(c.keywords))) return false;
    }
    return true;
  });
}

function render() {
  displayReviews(applyFilter(allReviews, activeFilter), '#wineBoxes');
}

async function loadAndRender() {
  const reviews = await fetchReviews();
  reviews.sort((a, b) => convertDate(b.date) - convertDate(a.date));
  allReviews = reviews;
  render();
}

loadAndRender();

const stars = document.querySelectorAll('.star');
const starsContainer = document.getElementById('stars');

function paintStars(value) {
  stars.forEach(s => {
    const v = +s.dataset.val;
    s.classList.remove('lit', 'halfLit');
    if (v <= Math.floor(value)) s.classList.add('lit');
    else if (v - 0.5 === value) s.classList.add('halfLit');
  });
}

function valueFromEvent(star, e) {
  const rect = star.getBoundingClientRect();
  const isLeftHalf = (e.clientX - rect.left) < rect.width / 2;
  return +star.dataset.val - (isLeftHalf ? 0.5 : 0);
}

stars.forEach(s => {
  s.addEventListener('mousemove', e => paintStars(valueFromEvent(s, e)));
  s.addEventListener('mouseleave', () => paintStars(+starsContainer.dataset.rating || 0));
  s.addEventListener('click', e => {
    const v = valueFromEvent(s, e);
    const current = +starsContainer.dataset.rating || 0;
    const next = current === v ? 0 : v;
    starsContainer.dataset.rating = String(next);
    paintStars(next);
  });
});

const form = document.getElementById('searchWine');
const backdrop = document.getElementById('backdrop');
const filterBtn = document.getElementById('filterButton');
const addWineBtn = document.getElementById('addWineButton');
const submitBtn = form.querySelector('button[type="submit"]');
const nameInput = document.getElementById('nameOfWine');
const grapeInput = document.getElementById('grape');
const colorInput = document.getElementById('color');
const priceInput = document.getElementById('price');
const locationInput = document.getElementById('location');
const yearInput = document.getElementById('year');
const keywordsInput = document.getElementById('keywords');
const foodInput = document.getElementById('food');
const descriptionField = document.getElementById('description');
const imageLabel = document.getElementById('imageLabel');
const imageInput = document.getElementById('addImage');
const uploadFileName = document.getElementById('uploadFileName');
const uploadPreview = document.getElementById('uploadPreview');

let previewUrl = null;

function showPreview(file) {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }
  if (!file) {
    uploadPreview.removeAttribute('src');
    uploadFileName.textContent = '';
    imageLabel.classList.remove('hasFile');
    return;
  }
  previewUrl = URL.createObjectURL(file);
  uploadPreview.src = previewUrl;
  uploadFileName.textContent = file.name;
  imageLabel.classList.add('hasFile');
}

function setFile(file) {
  if (!file) {
    imageInput.value = '';
    showPreview(null);
    return;
  }
  const dt = new DataTransfer();
  dt.items.add(file);
  imageInput.files = dt.files;
  showPreview(file);
}

imageInput.addEventListener('change', () => {
  showPreview(imageInput.files[0] || null);
});

let formMode = 'add';

function fillForm(c) {
  nameInput.value = c?.name || '';
  grapeInput.value = c?.grape || '';
  colorInput.value = c?.color || '';
  priceInput.value = c?.price || '';
  locationInput.value = c?.location || '';
  yearInput.value = c?.year || '';
  keywordsInput.value = c?.keywords || '';
  foodInput.value = '';
  descriptionField.value = '';
  starsContainer.dataset.rating = String(c?.rating || 0);
  paintStars(+starsContainer.dataset.rating);
}

function showForm(mode) {
  formMode = mode;
  if (mode === 'filter') {
    nameInput.required = false;
    descriptionField.classList.add('hidden');
    imageLabel.classList.add('hidden');
    submitBtn.textContent = activeFilter ? 'Update filter' : 'Apply filter';
    fillForm(activeFilter);
  } else {
    nameInput.required = true;
    descriptionField.classList.remove('hidden');
    imageLabel.classList.remove('hidden');
    setFile(null);
    submitBtn.textContent = 'Save review';
    fillForm(null);
  }
  form.classList.remove('hidden');
  backdrop.classList.remove('hidden');
}

function hideForm() {
  form.classList.add('hidden');
  backdrop.classList.add('hidden');
}

filterBtn.addEventListener('click', () => showForm('filter'));
addWineBtn.addEventListener('click', () => showForm('add'));
backdrop.addEventListener('click', hideForm);

function hasFiles(e) {
  return e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files');
}

function acceptDroppedFile(file) {
  if (!file) return;
  if (file.type && !file.type.startsWith('image/')) {
    alert('Only image files can be dropped here.');
    return;
  }
  if (form.classList.contains('hidden') || formMode !== 'add') {
    showForm('add');
  }
  setFile(file);
}

['dragenter', 'dragover'].forEach(evt => {
  imageLabel.addEventListener(evt, e => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    imageLabel.classList.add('dragOver');
  });
});

imageLabel.addEventListener('dragleave', e => {
  if (!imageLabel.contains(e.relatedTarget)) {
    imageLabel.classList.remove('dragOver');
  }
});

imageLabel.addEventListener('drop', e => {
  if (!hasFiles(e)) return;
  e.preventDefault();
  e.stopPropagation();
  imageLabel.classList.remove('dragOver');
  acceptDroppedFile(e.dataTransfer.files[0]);
});

window.addEventListener('dragover', e => {
  if (!hasFiles(e)) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});

window.addEventListener('drop', e => {
  if (!hasFiles(e)) return;
  e.preventDefault();
  imageLabel.classList.remove('dragOver');
  acceptDroppedFile(e.dataTransfer.files[0]);
});

form.addEventListener('submit', async event => {
  event.preventDefault();

  const criteria = {
    name: nameInput.value.trim(),
    grape: grapeInput.value.trim(),
    color: colorInput.value,
    price: priceInput.value.trim(),
    location: locationInput.value.trim(),
    year: yearInput.value,
    rating: Number(starsContainer.dataset.rating) || 0,
    keywords: keywordsInput.value.trim(),
  };

  if (formMode === 'filter') {
    const hasAny = Object.values(criteria).some(v => v !== '' && v !== 0);
    activeFilter = hasAny ? criteria : null;
    render();
    hideForm();
    return;
  }

  const payload = { ...criteria, description: descriptionField.value };
  const file = imageInput.files[0];
  if (file) {
    payload.imageData = await fileToBase64(file);
    payload.imageExt = file.name.split('.').pop().toLowerCase();
  }

  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    alert(`Failed to save review: ${err.error || response.statusText}`);
    return;
  }

  hideForm();
  await loadAndRender();
});
