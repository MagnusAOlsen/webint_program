fetchReviews().then(reviews => {

    reviews.sort((a, b) => {
        const dateA = convertDate(a.date);
        const dateB = convertDate(b.date);
        return dateB - dateA; 
    });

    displayReviews(reviews, '#wineReviewImages', 4);
});

function convertDate(dateString) {
    const [day, month, year] = dateString.split('.');
    return new Date(`${year}-${month}-${day}`);
}



