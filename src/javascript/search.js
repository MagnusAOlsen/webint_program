// const wines = 
//     [
//     {
//         "id": 1,
//         "name": "Château Montclair",
//         "brand": "Montclair Estates",
//         "year": 2018,
//         "type": "Red",
//         "grape": "Cabernet Sauvignon",
//         "region": "Bordeaux, France",
//         "alcohol_percent": 13.5,
//         "price_eur": 24.99,
//         "image": "to_be_changed.jpg"
//     },
//     {
//         "id": 2,
//         "name": "Verde Alto",
//         "brand": "Casa Verde",
//         "year": 2022,
//         "type": "White",
//         "grape": "Sauvignon Blanc",
//         "region": "Loire Valley, France",
//         "alcohol_percent": 12.0,
//         "price_eur": 14.5,
//         "image": "to_be_changed.jpg"
//     },
//     {
//         "id": 3,
//         "name": "Rosato Sereno",
//         "brand": "Tenuta Sereno",
//         "year": 2021,
//         "type": "Rosé",
//         "grape": "Grenache",
//         "region": "Provence, France",
//         "alcohol_percent": 12.5,
//         "price_eur": 16.0,
//         "image": "to_be_changed.jpg"
//     },
//     {
//         "id": 4,
//         "name": "Barolo Riserva",
//         "brand": "Cantina Alba",
//         "year": 2016,
//         "type": "Red",
//         "grape": "Nebbiolo",
//         "region": "Piedmont, Italy",
//         "alcohol_percent": 14.5,
//         "price_eur": 39.9,
//         "image": "to_be_changed.jpg"
//     },
//     {
//         "id": 5,
//         "name": "Sparkling Luna",
//         "brand": "Luna Vineyards",
//         "year": 2023,
//         "type": "Sparkling",
//         "grape": "Chardonnay / Pinot Noir",
//         "region": "Champagne, France",
//         "alcohol_percent": 11.5,
//         "price_eur": 29.99,
//         "image": "to_be_changed.jpg"
//     },
//     {
//         "id": 6,
//         "name": "Tempranillo Oro",
//         "brand": "Bodega Sol Dorado",
//         "year": 2020,
//         "type": "Red",
//         "grape": "Tempranillo",
//         "region": "Rioja, Spain",
//         "alcohol_percent": 13.8,
//         "price_eur": 18.75,
//         "image": "to_be_changed.jpg"
//     }

// ];

let wines = [];

async function loadWines() {
    const response = await fetch("../../data/reviews.json");
}


function displayWines(wines) {
    const container = document.querySelector(".wineResults");
    container.innerHTML = "";

    wines.forEach(wine => {
        const card = document.createElement("div");
        card.classList.add("wineCard");

        card.innerHTML = `
            <h3>${wine.name}</h3>
            <p>${wine.year} - ${wine.region}</p>
            <p>${wine.grape}</p>
            <p>${wine.price_eur} €</p>
        `;

        container.appendChild(card);
    });
}

function filterWines(wine, criteria) {
    const nameFilter = !criteria.name ||
        wine.name.toLowerCase().includes(criteria.name.toLowerCase());

    const yearFilter = !criteria.year ||
        wine.year == criteria.year;

    const grapeFilter = !criteria.grape ||
        wine.grape.toLowerCase().includes(criteria.grape.toLowerCase());

    const regionFilter = !criteria.location ||
        wine.region.toLowerCase().includes(criteria.location.toLowerCase());


    return nameFilter && yearFilter && grapeFilter && regionFilter;
}

function doesWineMatchKeywords(wine, keywords) {
    const words = (keywords || "").trim().toLowerCase().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
        return true;
    }

    const wineText = [
        wine.name,
        wine.brand,
        wine.type,
        wine.grape,
        wine.region,
        String(wine.year)
    ].join(" ").toLowerCase();

    return words.some(word => wineText.includes(word));
}



/* 
    This code handles 2 cases:
    - case 1: when the search comes from homepage, we get the parameters from the URL
              and apply the filter, then show the results
    - case 2: when the search comes from the search page, apply directly the filter
*/

const form = document.querySelector(".findWines");
if (form){
    form.addEventListener("submit", function(e) {
    e.preventDefault();

    const criteria = {
        name: document.getElementById("wine-name").value,
        year: document.getElementById("wine-year").value,
        grape: document.getElementById("wine-grape").value,
        location: document.getElementById("wine-location").value,
        keywords: document.getElementById("wine-keywords").value
    };

    let filtered = wines.filter(wine => filterWines(wine, criteria));

    // use keywords ONLY if nothing found
    if (filtered.length === 0 && criteria.keywords) {
        filtered = wines.filter(wine =>
            doesWineMatchKeywords(wine, criteria.keywords)
        );
    }

    displayWines(filtered);

    // save on local storage
    localStorage.setItem("lastSearch", JSON.stringify(criteria));
    
    })
};


document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);

    let criteria = null;

    // coming from homepage (URL has values)
    if (params.toString().length > 0) {
        criteria = {
            name: params.get("Name") || "",
            year: params.get("Year") || "",
            grape: params.get("Grape") || "",
            location: params.get("Location") || "",
            keywords: params.get("Keywords") || ""
        };

        localStorage.setItem("lastSearch", JSON.stringify(criteria));
    }

    else {
        const saved = localStorage.getItem("lastSearch");
        if (saved) {
            criteria = JSON.parse(saved);
        }
    }

    // Apply results
    if (criteria) {
        // fill inputs (only if they exist)
        const nameInput = document.getElementById("wine-name");
        const yearInput = document.getElementById("wine-year");
        const grapeInput = document.getElementById("wine-grape");
        const locationInput = document.getElementById("wine-location");
        const keywordsInput = document.getElementById("wine-keywords");

        if (nameInput) nameInput.value = criteria.name;
        if (yearInput) yearInput.value = criteria.year;
        if (grapeInput) grapeInput.value = criteria.grape;
        if (locationInput) locationInput.value = criteria.location;
        if (keywordsInput) keywordsInput.value = criteria.keywords;

        let filtered = wines.filter(wine => filterWines(wine, criteria));

        // use keywords ONLY if nothing found
        if (filtered.length === 0 && criteria.keywords) {
            filtered = wines.filter(wine =>
                doesWineMatchKeywords(wine, criteria.keywords)
            );
        }

        displayWines(filtered);
    } else {
        displayWines(wines);
    }
});

// show all (button)
const showAllButton = document.getElementById("showAllButton");
if (showAllButton) {
    showAllButton.addEventListener("click", () => {
        displayWines(wines);

        // remove last search 
        localStorage.removeItem("lastSearch");
    });
}

