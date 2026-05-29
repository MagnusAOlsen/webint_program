# WineLover

The main goal of the app is to create a space where users can share reviews and
opinions about different wines, making it easier for others to find options that suit
their taste.

Users should easily be able to find a wine they are thinking of, whether they have
had it before or not.

---

## Features

- **Wine Search** — Filter the wine database by name, grape, type, location, year, price, and keywords. 
- **My Reviews** — Add, view, and filter personal wine reviews with ratings, tasting notes, food pairings, and photos.
- **Homepage** — Displays a daily wine recommendation and a preview of your most recent reviews.
- **My Profile** — Shows user info, a personal quote, a map of reviewed wine origins, and recent reviews.
- **Help** — In-app guide covering all pages and usage tips.

---

## Repository Structure

```
/
├── data/
│   ├── myReviews.json        
│   └── wineReviews.json     
│
├── images/
│   ├── wines/                
│   ├── stars/                
│   └── ...                   # App icons and UI assets
│
└── src/
    ├── html/
    │   ├── homepage.html
    │   ├── search.html
    │   ├── myReviews.html
    │   ├── myProfile.html
    │   └── help.html
    │
    ├── styles/
    │   ├── global.css         # Shared styles (header, footer, wine cards, modals)
    │   ├── homepage.css     
    │   ├── search.css         
    │   ├── myReviews.css     
    │   ├── myProfile.css      
    │   └── help.css         
    │
    └── javascript/
        ├── utils.js           # Shared utilities: fetch helpers, card rendering, modal
        ├── homepage.js        
        ├── search.js          
        ├── myReviews.js       
        └── myProfile.js 
        └── server.js      
│
└── Dockerfile
└── docker-compose.yml

```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/reviews` | Fetch all personal reviews |
| `POST` | `/api/reviews` | Add a new personal review |
| `GET` | `/api/wineReviews` | Fetch the wine search catalogue |

---

## Hosted Site

[https://www.winelover.online](https://www.winelover.online)

---

## AI Usage

- GitHub Copilot was used to identify redundancies in styling files.
- AI used to create the text for the help page. Prompt: ”Based on my application specifications, can you create the text for the help page? It should have a navigation guide as well.”
