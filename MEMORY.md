# Travel Kathegalu - Project Memory 🧠

This file serves as the "memory" and context for any AI assistant working on this project. It contains the core architecture, key decisions, and technical setup.

## 🚀 Project Overview
**Travel Kathegalu** is a premium creator portfolio and management dashboard for Devika Ramm.
- **Goal**: Transition from static placeholders to a live, statistics-driven media kit and portfolio.
- **User**: Devika Ramm (IG: @travel_kathegalu).

## 🛠 Tech Stack
- **Frontend**: Vanilla HTML5, CSS3 (Modern Glassmorphism), and JavaScript.
- **Backend**: Flask (`server.py`) serving a JSON API at `http://127.0.0.1:5000/api/stats`.
- **Data Source**: `instaloader` for scraping Instagram metrics and media.
- **Assets**: Local storage in `/assets` to bypass Instagram's expiring CDN URLs.

## 📁 Key File Map
- `index.html`: The public-facing premium portfolio/pitch deck.
- `dashboard.html`: Internal creator dashboard for content planning and revenue tracking.
- `server.py`: Flask backend. Authenticates with IG, fetches stats, downloads thumbnails, and calculates Engagement Rate.
- `portfolio.js`: Logic for the public portfolio (stat injection, scroll animations, case study parsing).
- `app.js`: Logic for the internal dashboard.
- `portfolio.css`: Main styling for the portfolio (Premium aesthetic).
- `.env`: Contains `IG_USERNAME` and `IG_PASSWORD`. **CRITICAL: Keep this private.**

## ⚙️ Core Logic & Decisions
1. **Hero Image**: The Hero image was originally dynamic but is now **locked** to `assets/custom_hero.jpg` for artistic consistency.
2. **Reel Showcase**: The Content Showcase grid is **hardcoded** in `index.html` with local thumbnails (`reel_1.jpg`, etc.) because Instagram's remote image links expire quickly.
3. **Case Studies**: The "Collaboration Portfolio" section is **dynamic**. `portfolio.js` takes captions from the top-performing reels (indices 5-6), cleans them (removing hashtags), and injects them as titles and descriptions.
4. **Backend Caching**: `server.py` caches Instagram data for 1 hour to prevent rate-limiting/shadowbanning.

## 🏃 Running the Project
1. **Start Backend**: `python3 server.py` (Runs on port 5000).
2. **Start Frontend**: `python3 -m http.server 8000` (Runs on port 8000).
3. **Local URL**: [http://localhost:8000/index.html](http://localhost:8000/index.html).

## 📝 Roadmap / Next Steps
- [ ] **Deployment**: Move from `localhost` to a public host (e.g., Render for backend, Vercel for frontend).
- [ ] **Email Integration**: Currently uses `mailto:`. Consider a proper backend email service (SendGrid/Mailgun).
- [ ] **Performance**: Optimize image sizes in the `assets/` folder.

## 🤖 Travel Strategy Bot
- **Purpose**: Autonomous research and strategic decision making.
- **Location**: `.agent/skills/travel_strategy/`
- **Protocol**: Use the `Travel Strategy Bot` skill for trend analysis and brand pitch audits.
- **Output**: Findings are recorded in `STRATEGY.md`.
