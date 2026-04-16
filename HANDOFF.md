# Travel Kathegalu - Handoff Document 🗺️

## 👋 Hey there!
If you're picking up this project, you're looking at **Travel Kathegalu**, a high-end creator portfolio for Devika Ramm. The goal of this project is to provide a professional media kit that speaks "Premium Strategy" to brands and hotels.

## 🏗️ Architecture
The project is split into two parts:
1. **Public Portfolio (`index.html`)**: The pitch deck brands see.
2. **Management Dashboard (`dashboard.html`)**: Where Devika manages content ideas and revenue.

## ⚡ Current System State
- **Backend**: A Python Flask server (`server.py`) handles the "heavy lifting." It logs into Instagram, scrapes the latest followers/ER stats, downloads post thumbnails locally (to prevent broken images), and sends it to the frontend.
- **Frontend**: A custom-built, responsive portfolio with scroll animations and glassmorphism.

## 🔑 Key Setup Instructions
1. **Instagram Credentials**: Ensure the `.env` file has the correct `IG_USERNAME` and `IG_PASSWORD`.
2. **Environment**: Install dependencies via `pip install -r requirements.txt`.
3. **Execution**:
   - Terminal 1: `python3 server.py` (API)
   - Terminal 2: `python3 -m http.server 8000` (Website)

## 📌 Important Notes for Future Updates
- **Hero Image**: Is currently set to `assets/custom_hero.jpg`. To change it, simply replace that file.
- **Image CDN**: We avoid linking directly to Instagram image URLs because they expire. The backend downloads them to `assets/` first.
- **Reel Grid**: The 4 main showcase reels are currently hardcoded in `index.html` with local images for 100% reliability.
- **Case Studies**: These are dynamic! They are pulled from Devika's top-performing posts using captions to tell a story automatically.

## 🚀 Next Steps
- **Production Deployment**: Currently runs on localhost. Needs a host like Render or Railway for the backend.
- **Official API**: If scaling, move from `instaloader` (scraping) to the official Facebook Graph API for higher reliability.

---
*Created with care by Antigravity.*
