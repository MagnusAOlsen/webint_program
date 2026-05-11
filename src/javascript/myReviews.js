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
const descriptionField = document.getElementById('description');
const imageLabel = document.getElementById('imageLabel');
const imageInput = document.getElementById('addImage');

let formMode = 'add';

function fillForm(c) {
  nameInput.value = c?.name || '';
  document.getElementById('location').value = c?.location || '';
  document.getElementById('year').value = c?.year || '';
  document.getElementById('keywords').value = c?.keywords || '';
  document.getElementById('food').value = '';
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
    imageInput.value = '';
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

form.addEventListener('submit', async event => {
  event.preventDefault();

  const criteria = {
    name: nameInput.value.trim(),
    location: document.getElementById('location').value.trim(),
    year: document.getElementById('year').value,
    rating: Number(starsContainer.dataset.rating) || 0,
    keywords: document.getElementById('keywords').value.trim(),
  };

  if (formMode === 'filter') {
    const hasAny = criteria.name || criteria.location || criteria.year || criteria.rating || criteria.keywords;
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
