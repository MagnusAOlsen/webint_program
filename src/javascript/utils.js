function fetchReviews() {
    return fetch('../../data/reviews.json')
        .then(response => response.json())
        .catch(error => console.error("Error loading reviews", error));
}

function displayReviews(reviews, containerId, limit=null) {
    const container = document.querySelector(containerId);
    container.innerHTML = '';

    const reviewsToShow = limit ? reviews.slice(0, limit) : reviews;

    reviewsToShow.forEach(review => {
        const wineDiv = document.createElement('div');
        wineDiv.className = 'wine';
        wineDiv.innerHTML = `
            <div class="placeYearDate">
                <p>${review.year}, ${review.location}</p>
                <p>${review.date}</p>
            </div>
            <h3>${review.name}</h3>
            <img src="${review.img}">
            <div class="wineImageStars">
                <img src="../../images/stars/Star_rating_${review.rating}_of_5.png">
            </div>
            <p>${review.description}</p>
        `;
        
        container.appendChild(wineDiv);
    })
}