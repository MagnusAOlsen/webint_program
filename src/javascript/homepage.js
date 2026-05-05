fetchReviews().then(reviews => {
    displayReviews(reviews, '#wineReviewImages', 4);
})