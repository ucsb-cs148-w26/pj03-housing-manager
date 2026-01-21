<font size="5">**Housing Application Manager**</font>
A web application designed to easily prase through different leasing companies and their various housing information with provided user pereferences.

---

## Hello World Demo (lab01)

This is a React-based Hello World application for CS148 lab01.

### Deployed App URL
**

### Prerequisites
Before running this app, make sure you have the following installed:
- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Python 3.10+** - [Download here](https://www.python.org/downloads/)

### Installation Instructions
1. Clone this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App Locally

You need to run both the backend (Python) and frontend (React) servers.

#### 1. Start the Backend (Scraper API)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (first time only)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Install Playwright browsers (first time only)
playwright install chromium

# Start the backend server
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

#### 2. Start the Frontend

In a new terminal:
```bash
# From the project root directory
npm install  # First time only
npm run dev
```

The app will open at `http://localhost:5173` in your browser.

#### 3. Using the Scraper

1. Open `http://localhost:5173` in your browser
2. Select a housing site from the dropdown (e.g., "Meridian Group Real Estate")
3. Click "Scrape Listings"
4. View the scraped rental listings with price, beds, baths, and address

### Building for Production
To create a production build:
```bash
npm run build
```

### Deployment

The app requires deploying both the **backend** (Python API) and **frontend** (React) separately.

#### 1. Deploy Backend to Railway

[Railway](https://railway.app/) offers a free tier that supports Docker deployments.

1. Create a free account at [Railway](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository and set the **Root Directory** to `backend`
4. Railway will detect the Dockerfile and deploy automatically
5. Add environment variable in Railway dashboard:
   - `ALLOWED_ORIGINS` = `https://your-vercel-app.vercel.app` (your Vercel frontend URL)
6. Copy your Railway backend URL (e.g., `https://your-app.up.railway.app`)

#### 2. Deploy Frontend to Vercel

1. Create a free account at [Vercel](https://vercel.com/)
2. Click "New Project" → Import your GitHub repository
3. **Important:** Add environment variable before deploying:
   - `VITE_API_URL` = `https://your-app.up.railway.app` (your Railway backend URL)
4. Deploy - Vercel will auto-detect Vite and build

#### 3. Update Backend CORS

After deploying frontend, go back to Railway and update:
- `ALLOWED_ORIGINS` = `https://your-actual-vercel-url.vercel.app`

#### Alternative: Render

[Render](https://render.com/) is another free option for the backend:

1. Create account at [Render](https://render.com/)
2. New → Web Service → Connect your repo
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `pip install -r requirements.txt && playwright install chromium && playwright install-deps chromium`
5. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variable: `ALLOWED_ORIGINS` = your Vercel URL

---

## Project Structure

```
pj03-housing-manager/
├── backend/                 # Python backend (FastAPI + Playwright)
│   ├── main.py             # API server with scrape endpoints
│   ├── requirements.txt    # Python dependencies
│   └── scrapers/           # Site-specific scrapers
│       └── meridian.py     # Meridian Group Real Estate scraper
├── src/                    # React frontend
│   ├── App.jsx             # Main app with scraper UI
│   └── components/         # React components
│       ├── ListingCard.jsx # Individual listing display
│       └── ListingList.jsx # Listings grid container
└── package.json            # Node.js dependencies
```

## Adding New Scrapers

To add support for a new housing site:

1. **Create a new scraper** in `backend/scrapers/` (e.g., `newsite.py`):
   ```python
   from playwright.async_api import async_playwright
   from datetime import datetime

   async def scrape_newsite() -> dict:
       # Implement scraping logic
       return {"listings": [...], "scraped_at": "...", "source": "newsite"}
   ```

2. **Add an endpoint** in `backend/main.py`:
   ```python
   from scrapers.newsite import scrape_newsite

   @app.get("/scrape/newsite")
   async def scrape_newsite_endpoint():
       return await scrape_newsite()
   ```

3. **Add to frontend dropdown** in `src/App.jsx`:
   ```javascript
   const SCRAPERS = [
     { id: 'meridian', name: 'Meridian Group Real Estate', url: 'meridiangrouprem.com' },
     { id: 'newsite', name: 'New Site Name', url: 'newsite.com' },
   ]
   ```

---

## Project Description

Our project has no counterpart.

Our ideal users are UCSB students living in or planning to live in Isla Vista.

We will have an admin side and a normal user side. The admins will manage the info that the users input and update new data as well as regulate content. Users sohuld be able to use their preferences and search for housing easily.

The goal of the app is to have students find their ideal leasing company/house that they can live in for next year. Should fit their price budgets, location, space, etc. And should be able to choose from a plethora of different leasing companies. Our app brings together all of the leasing companies and presents easy, readable, coordinated info for the user.

Technologies: python(good basic Backend data processing and aggregation of leasing information), react(Dynamic, responsive user interface for searching and filtering housing options), node.js(API layer and server-side communication between frontend and backend), playwright(Automated scraping and testing to collect and validate leasing data)

Team members:
Alex Yoon github: alyoon04  
Kyle Villeponteau github: kylevillepo1  
Nathan Mitter github: SexyJesusFreak  
Jeffrey Keem github: jeff496  
Timothy Nguyen github: timothy 878  
Alex Jeong github: alexjh2  
Om Kulkarni github: omkulkarni77  
Bryce Inouye github: bryce_inouye
