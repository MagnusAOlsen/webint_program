let today = getTodayString();
let x = parseInt(localStorage.getItem('wineIndex')) || 1;
let wineOfTheDay;

fetchReviews().then(reviews => {

    reviews.sort((a, b) => {
        const dateA = convertDate(a.date);
        const dateB = convertDate(b.date);
        return dateB - dateA; 
    });
    
    displayReviews(reviews, '#wineReviewImages', 4);

});

fetchSearchReviews().then(searchReviews => {
    displayWineOfTheDay(today, searchReviews);
})

function convertDate(dateString) {
    const [day, month, year] = dateString.split('.');
    return new Date(`${year}-${month}-${day}`);
}

function getTodayString() {
    return new Date().toISOString().split("T")[0];
}

function displayWineOfTheDay(currentDate, reviews) {
    const lastDate = localStorage.getItem('lastWineDate');

    if (currentDate !== lastDate) {
        x = x < reviews.length ? x + 1 : 1;
        localStorage.setItem('wineIndex', x);
        localStorage.setItem('lastWineDate', currentDate);
    }
   
    wineOfTheDay = reviews.find(u => u.id === x);
    displayReviews([wineOfTheDay], '#wineOfTheDay', 1);
}

   


