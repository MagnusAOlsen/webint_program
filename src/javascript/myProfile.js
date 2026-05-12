function parseReviewDate(s) {
    const [d, m, y] = s.split('.');
    return new Date(`${y}-${m}-${d}`);
}



// map functionality - adapted from https://leafletjs.com/examples/quick-start/ and https://nominatim.org/release-docs/latest/api/Search/
async function getCoordinates(location) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            return { lat: data[0].lat, lng: data[0].lon };
        }
    } catch (error) {
        console.error(`Geocoding failed for ${location}:`, error);
    }
    return null;
}

// Initialize the map and place markers for each review
async function initWineMap(reviews) {
    const map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    for (const review of reviews) {
        const coords = await getCoordinates(review.location);
        
        if (coords) {
            const marker = L.marker([coords.lat, coords.lng]).addTo(map);
            marker.bindPopup(`
                <strong>${review.name}</strong><br>
                ${review.location}<br>
                <em>${review.date}</em>
            `);
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const reviewsData = await fetchReviews();
    if (!reviewsData || reviewsData.length === 0) return;

    reviewsData.sort((a, b) => parseReviewDate(b.date) - parseReviewDate(a.date));

    if (document.querySelector('#profileReviewsGrid')) {
        displayReviews(reviewsData, '#profileReviewsGrid', 3);
    } else if (document.querySelector('.wineBoxes')) {
        displayReviews(reviewsData, '.wineBoxes');
    }

    if (document.getElementById('map')) {
        initWineMap(reviewsData);
    }
});