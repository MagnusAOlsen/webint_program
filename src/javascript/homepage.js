let today = getTodayString();
let x = 1;
let wineOfTheDay;

fetchReviews().then(reviews => {

    reviews.sort((a, b) => {
        const dateA = convertDate(a.date);
        const dateB = convertDate(b.date);
        return dateB - dateA; 
    });

    wineOfTheDay = reviews.find(u => u.id === x);

    displayReviews(reviews, '#wineReviewImages', 4);

    displayWineOfTheDay(getTodayString(), reviews);
});

function convertDate(dateString) {
    const [day, month, year] = dateString.split('.');
    return new Date(`${year}-${month}-${day}`);
}

function getTodayString() {
    return new Date().toISOString().split("T")[0];
}


function displayWineOfTheDay(currentDate, reviews) {
    if (currentDate !== today) {
        if (x < reviews.length) {
            x += 1;
        } else {
            x = 1;
        }
        
        today = currentDate;
        wineOfTheDay = reviews.find(u => u.id === x);
    }

    displayReviews([wineOfTheDay], '#wineOfTheDay', 1);
}

