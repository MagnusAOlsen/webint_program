let wines = [];

async function loadWines() {
    try {
        const response = await fetch("../../data/wineReviews.json");
        wines = await response.json();
    }
    catch (error) {
        console.error("Failed to load reviews", error);
        wines = [];
    }
}

function displayWines(winesToDisplay) {
    const container = document.querySelector(".wineResults");
    container.innerHTML = "";

    if (winesToDisplay.length === 0) {
        container.innerHTML = "<p>No wines found.</p>";
        return;
    }

    winesToDisplay.forEach(wine => {
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


function getCriteriaFromInputs() {
    return {
        name: document.getElementById("wine-name").value,
        year: document.getElementById("wine-year").value,
        grape: document.getElementById("wine-grape").value,
        location: document.getElementById("wine-location").value,
        keywords: document.getElementById("wine-keywords").value
    };
}

function fillInputs(criteria) {
    document.getElementById("wine-name").value = criteria.name || "";
    document.getElementById("wine-year").value = criteria.year || "";
    document.getElementById("wine-grape").value = criteria.grape || "";
    document.getElementById("wine-location").value = criteria.location || "";
    document.getElementById("wine-keywords").value = criteria.keywords || "";
}

function searchWines(criteria) {
    let filtered = wines.filter(wine => filterWines(wine, criteria));

    if (filtered.length === 0 && criteria.keywords) {
        filtered = wines.filter(wine => 
            doesWineMatchKeywords(wine, criteria.keywords)
        );
    }

    displayWines(filtered);
}

/* 
    This code handles 2 cases:
    - case 1: when the search comes from homepage, we get the parameters from the URL
              and apply the filter, then show the results
    - case 2: when the search comes from the search page, apply directly the filter
*/


document.addEventListener("DOMContentLoaded", async () => {
    await loadWines();

    const form = document.querySelector(".findWines");
    const showAllButton = document.getElementById("showAllButton");
    const params = new URLSearchParams(window.location.search);

    let criteria = null;

    if (params.toString().length > 0) {
        criteria = {
            name: params.get("Name") || "",
            year: params.get("Year") || "",
            grape: params.get("Grape") || "",
            location: params.get("Location") || "",
            keywords: params.get("Keywords") || ""
        };

        localStorage.setItem("lastSearch", JSON.stringify(criteria));
    } else {
        const saved = localStorage.getItem("lastSearch");

        if (saved) {
            criteria = JSON.parse(saved);
        }
    }

    if (criteria) {
        fillInputs(criteria);
        searchWines(criteria);
    } else {
        displayWines(wines);
    }

    if (form) {
        form.addEventListener("submit", event => {
            event.preventDefault();

            const newCriteria = getCriteriaFromInputs();

            localStorage.setItem("lastSearch", JSON.stringify(newCriteria));
            searchWines(newCriteria);
        });
    }

    if (showAllButton) {
        showAllButton.addEventListener("click", () => {
            localStorage.removeItem("lastSearch");
            form.reset();
            displayWines(wines);
        });
    }
});

