async function fetchReviews() {
    try {
        const response = await fetch('../../data/myReviews.json');
        
        if (!response.ok) {
            throw new Error(`Error! ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error loading reviews:", error);
        return [];
    }
}

function displayReviews(reviews, containerId, limit = null) {
    const container = document.querySelector(containerId);
    container.innerHTML = '';

    // allow for a limit to be set for the reviews to display
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
            <div class="wineImageReview">
                <img src="${review.img}" alt="${review.name}">
            </div>
            <div class="wineImageStars">
                <img src="../../images/stars/Star_rating_${review.rating}_of_5.png" alt="${review.rating} stars">
            </div>
            <p class="reviewText">${review.description}</p>
        `;
        
        container.appendChild(wineDiv);
    });
}

// when the dom is loaded, then fetch the reviews and display with set limit
document.addEventListener('DOMContentLoaded', async () => {
    const reviewsData = await fetchReviews();
    
    if (reviewsData.length > 0) {
        // Check if we are on the Profile page (using the limit)
        if (document.querySelector('#profileReviewsGrid')) {
            displayReviews(reviewsData, '#profileReviewsGrid', 3);
        } 
        // Or if we are on the Full Reviews page
        else if (document.querySelector('.wineBoxes')) {
            displayReviews(reviewsData, '.wineBoxes');
        }
    }
});