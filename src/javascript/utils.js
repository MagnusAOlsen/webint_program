function fetchReviews() {
    return fetch('../../data/myReviews.json')
        .then(response => response.json())
        .catch(error => console.error("Error loading reviews", error));
}

function fetchSearchReviews() {
    return fetch('../../data/wineReviews.json')
        .then(response => response.json())
        .catch(error => console.error("Error loading wine reviews", error));
}

function ensureFullWineModal() {
    if (!document.getElementById('backdrop')) {
        const b = document.createElement('div');
        b.id = 'backdrop';
        b.className = 'hidden';
        document.body.appendChild(b);
    }
    if (!document.getElementById('fullWine')) {
        const f = document.createElement('div');
        f.id = 'fullWine';
        f.className = 'fullWine hidden';
        document.body.appendChild(f);
    }
    const backdrop = document.getElementById('backdrop');
    if (!backdrop.dataset.fullWineBound) {
        backdrop.addEventListener('click', hideFullWine);
        backdrop.dataset.fullWineBound = '1';
    }
}

function showFullWine(review) {
    ensureFullWineModal();
    const fullWine = document.getElementById('fullWine');
    const backdrop = document.getElementById('backdrop');
    const keywords = Array.isArray(review.keywords) ? review.keywords.join(', ') : (review.keywords || '');
    const food = Array.isArray(review.food) ? review.food.join(', ') : (review.food || '');
    fullWine.innerHTML = `
        <button class="fullWineClose" onclick="hideFullWine()">✕</button>
        <div class="placeYearDate">
            <p>${review.year}, ${review.location}</p>
            <p>${review.date}</p>
        </div>
        <h2>${review.name}</h2>
        <img class="wineCardImage" src="${review.img}">
        <div class="wineImageStars">
            <img src="../../images/stars/Star_rating_${review.rating}_of_5.png">
        </div>
        <p><strong>Grape:</strong> ${review.grape || ''}</p>
        <p><strong>Color:</strong> ${review.color || ''}</p>
        <p><strong>Price:</strong> ${review.price || ''}</p>
        <p><strong>Keywords:</strong> ${keywords}</p>
        <p><strong>Food pairing:</strong> ${food}</p>
        <p>${review.description || ''}</p>
    `;
    fullWine.classList.remove('hidden');
    backdrop.classList.remove('hidden');
}

function hideFullWine() {
    const fullWine = document.getElementById('fullWine');
    const backdrop = document.getElementById('backdrop');
    if (fullWine) fullWine.classList.add('hidden');
    if (backdrop) backdrop.classList.add('hidden');
}

function displayReviews(reviews, containerId, limit=null, showPrice=false) {
    const container = document.querySelector(containerId);
    container.innerHTML = '';

    const reviewsToShow = limit ? reviews.slice(0, limit) : reviews;

    reviewsToShow.forEach(review => {
        const wineDiv = document.createElement('div');
        wineDiv.className = 'wine';
        const keywords = Array.isArray(review.keywords) ? review.keywords.join(', ') : '';
        wineDiv.innerHTML = `
            <div class="placeYearDate">
                <p>${review.year}, ${review.location}</p>
                <p>${review.date}</p>
            </div>
            <h3>${review.name}</h3>
            <img class="wineCardImage" src="${review.img}">
            <div class="wineImageStars">
                <img src="../../images/stars/Star_rating_${review.rating}_of_5.png">
            </div>
            ${showPrice && review.price ? `<p class="winePrice">${review.price}</p>` : ''}
            <p class="wineKeywords">${keywords}</p>
            <p class="wineDescription">${review.description}</p>
        `;
        wineDiv.addEventListener('click', () => showFullWine(review));
        container.appendChild(wineDiv);
    })
}