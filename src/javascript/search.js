let wines = [];
let currentResults = [];
let currentSort = null;


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

    if (winesToDisplay.length === 0) {
        container.innerHTML = "<p>No wines found.</p>";
        return;
    }

    displayReviews(winesToDisplay, ".wineResults");
}

function normalize(str) {
    return String(str ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function parsePrice(priceStr) {
    return parseFloat(String(priceStr).replace(/[^0-9.]/g, ""));
}

function filterWines(wine, criteria) {
    const nameFilter = !criteria.name ||
        normalize(wine.name).includes(normalize(criteria.name));

    const yearFilter = !criteria.year ||
        wine.year == criteria.year;

    const grapeFilter = !criteria.grape ||
        normalize(wine.grape).includes(normalize(criteria.grape));

    const locationFilter = !criteria.location ||
        normalize(wine.location).includes(normalize(criteria.location));

    const typeFilter = !criteria.type ||
        normalize(wine.color) === normalize(criteria.type);

    let priceFilter = true;
    if (criteria.price) {
        const target = parsePrice(criteria.price);
        const winePrice = parsePrice(wine.price);
        if (!isNaN(target) && !isNaN(winePrice)) {
            priceFilter = winePrice >= target * 0.8 && winePrice <= target * 1.2;
        }
    }

    const keywordFilter = doesWineMatchKeywords(wine, criteria.keywords);

    return nameFilter && yearFilter && grapeFilter && locationFilter && typeFilter && priceFilter && keywordFilter;
}

function doesWineMatchKeywords(wine, keywords) {
    const words = (keywords || "").trim().split(/\s+/).filter(Boolean).map(normalize);

    if (words.length === 0) {
        return true;
    }

    const wineText = normalize([
        wine.name,
        wine.color,
        wine.grape,
        wine.location,
        wine.description,
        Array.isArray(wine.keywords) ? wine.keywords.join(" ") : "",
        String(wine.year)
    ].join(" "));

    return words.some(word => wineText.includes(word));
}


function getCriteriaFromInputs() {
    return {
        name: document.getElementById("wine-name").value,
        year: document.getElementById("wine-year").value,
        grape: document.getElementById("wine-grape").value,
        type: document.getElementById("wine-type").value,
        location: document.getElementById("wine-location").value,
        price: document.getElementById("wine-price").value,
        keywords: document.getElementById("wine-keywords").value
    };
}

function fillInputs(criteria) {
    document.getElementById("wine-name").value = criteria.name || "";
    document.getElementById("wine-year").value = criteria.year || "";
    document.getElementById("wine-grape").value = criteria.grape || "";
    document.getElementById("wine-type").value = criteria.type || "";
    document.getElementById("wine-location").value = criteria.location || "";
    document.getElementById("wine-price").value = criteria.price || "";
    document.getElementById("wine-keywords").value = criteria.keywords || "";
}

function sortWines(list, sortType) {
    const sorted = [...list];
    if (sortType === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortType === "name-desc") sorted.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortType === "price-asc") sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    else if (sortType === "price-desc") sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    return sorted;
}

function searchWines(criteria) {
    currentResults = wines.filter(wine => filterWines(wine, criteria));
    displayWines(sortWines(currentResults, currentSort));
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
            type: params.get("Type") || "",
            location: params.get("Location") || "",
            price: params.get("Price") || "",
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
        currentResults = wines;
        displayWines(sortWines(currentResults, currentSort));
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
            currentResults = wines;
            displayWines(sortWines(currentResults, currentSort));
        });
    }

    const sortButton = document.getElementById("sortButton");
    const sortDropdown = document.getElementById("sortDropdown");

    sortButton.addEventListener("click", e => {
        e.stopPropagation();
        sortDropdown.classList.toggle("open");
    });

    document.addEventListener("click", () => {
        sortDropdown.classList.remove("open");
    });

    document.querySelectorAll(".sortOption").forEach(btn => {
        btn.addEventListener("click", () => {
            const chosen = btn.dataset.sort;
            currentSort = (currentSort === chosen) ? null : chosen;

            document.querySelectorAll(".sortOption").forEach(b => b.classList.remove("active"));
            if (currentSort) btn.classList.add("active");

            sortDropdown.classList.remove("open");
            displayWines(sortWines(currentResults, currentSort));
        });
    });
});
