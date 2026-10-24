# UFC 333: Volkanovski vs. Evloev - Quantitative Betting Matrix & Consensus Analytics Dashboard

A modern, high-performance web dashboard for UFC 333 featuring ensemble machine learning consensus, live Kelly Criterion bankroll staking, an interactive parlay builder, fighter statistical differential engines, and historical fight analytics.

Live Demo: `https://oscarbrimelow.github.io/UFC333/`

---

## Overview

This application serves as a fight card analytics suite and betting decision matrix for **UFC 333: Volkanovski vs. Evloev** (held at Etihad Arena, Abu Dhabi). It aggregates predictions across multiple statistical and machine learning models, compares quantitative edges against live market betting lines (including Kalshi prediction markets), and allows users to construct, price, and export custom parlay tickets with bankroll-optimized Kelly staking.

Built completely with vanilla HTML5, CSS3, and modern JavaScript (ES6+), the dashboard has zero external build dependencies, runs client-side in any modern browser, and is fully configured for instantaneous deployment on **GitHub Pages**.

---

---

## Attribution and Credits

Special credit and appreciation to **NBAtrev** (Vanderbilt University) for creating the foundational UFC Elo Engine and sharing the historical fight dataset:

* **Original Repository**: [NBAtrev/UFC-Elo-Engine](https://github.com/NBAtrev/UFC-Elo-Engine) by NBAtrev
* **Creator Background**: Vanderbilt University AI researcher who built an algorithmic Elo system figuring in every single bout in UFC history (from UFC 1 in 1993 through present day).
* **Calibrated Model Projections**:
  * **Alexander Volkanovski vs. Movsar Evloev**: Volkanovski is favored at **56.0%** (vs. Evloev at **44.0%**).
  * **Petr Yan vs. Merab Dvalishvili**: Merab Dvalishvili is rated as a slight favorite at **53.0%** (vs. Yan at **47.0%**).
* **YouTube Video & Demonstration**: [UFC Elo Prediction Video](https://www.youtube.com/watch?v=PLwhzlyjEgU)
* **Foundation Details**: The historical fight web-scraping architecture for `ufcstats.com` and the chess-style Elo rating engine benchmarked in this application (Tab 5 and the Cross-Model Consensus Matrix) are based on the work from NBAtrev's `UFC-Elo-Engine`.

### 6-Person Community Consensus Survey
A live focus group survey of 6 knowledgeable bettors was conducted on the marquee matchups of UFC 333:
1. **Alexander Volkanovski vs. Movsar Evloev**: **3-3 Split** (50.0% / 50.0% Deadlock)
2. **Petr Yan vs. Merab Dvalishvili**: **5-1 Yan** (83.3% Yan / 16.7% Merab — Heavy Yan Consensus)
3. **Lone'er Kavanagh vs. Ramazan Temirov**: **3-3 Split** (50.0% / 50.0% Deadlock)
4. **Alexander Volkov vs. Rizvan Kuniev**: **4-2 Kuniev** (66.7% Kuniev Underdog Lean / 33.3% Volkov)
5. **Aaron Pico vs. Losene Keita**: **3-3 Split** (50.0% / 50.0% Deadlock)

### Additional Data and Market Sources
* **Official Bout Records**: [UFC Stats](http://ufcstats.com/)
* **Event Betting Lines and Market Probabilities**: Kalshi Prediction Markets and consensus sportsbook feeds

---

## Core Features

### 1. Event Home Landing Page
* **Full 14-Bout Card View**: Grouped into Main Event, Co-Main Event, Main Card, Preliminary Card, and Early Prelims.
* **Fighter Matchup Cards**: Head-to-head fighter portrait photography, physical measurements (height, reach, stance), record, odds, and implied win probability.
* **Direct Parlay Integration**: Click any fighter's odds badge on the home page to instantly add them to your active parlay slip or jump directly to pre-configured tickets containing that fight.

### 2. Multi-Model Consensus Matrix & Ensemble Engine
* **6 Predictive Models Benchmarked**:
  1. Logistic Regression (Linear probability based on striking/grappling efficiency)
  2. Random Forest (Non-linear decision tree ensemble)
  3. Support Vector Machine (SVM margin classifier)
  4. Gradient Boosting (Sequential error-weighted boosting)
  5. Historical Elo Engine (Vanderbilt AI model by NBAtrev)
  6. Kalshi Prediction Market (Real-money crowd consensus)
* **Model Filter Toggles**: Interactively check or uncheck any individual model in real time. The dashboard automatically recalculates consensus agreement percentages, confidence metrics, and edge spreads dynamically.
* **Consensus Agreement Meter**: Instantly highlights unanimous picks (6/6 models, 100%), strong consensus (5/6, 83%), majority lean (4/6, 67%), and contested coin-flips (3/3 split).

### 3. Interactive Parlay Builder & Kelly Staking Engine
* **Custom Ticket Construction**: Select any combination of fighters across all 14 bouts to assemble single bets or multi-leg parlays.
* **Mathematical Precision**: Real-time calculation of cumulative parlay decimal odds, American moneyline format, combined implied probability, and payout multiplier.
* **Bankroll Sizing with Kelly Criterion**:
  * Calculates mathematically optimal wager sizing using the Kelly formula: `f* = (b*p - q) / b`
  * Supports Full Kelly, Half Kelly (Conservative), Quarter Kelly, and 1/8 Kelly risk-management profiles.
  * Live bankroll input field with instantaneous dollar stake and net profit projection updates.
* **Curated System Slips (14 Portfolio Tickets)**:
  * **Verified Lock Parlay 🔒**: High-probability core fighters with unanimous model consensus.
  * **Balanced Value Parlay**: Positive expected value (+EV) selections with model-to-market mispricings.
  * **Longshot Degenerate Parlays**: High-multiplier tickets across sharp underdogs.
  * **Slip 14 ("Might Be Alr")**: 13-Leg Multi-Market accumulator (Volk ML, Yan ML, Temirov KO/Dec, Yakhyaev Dec/O2.5, Keita U2.5, Murzakanov KO, Rowston ML, Aliev O2.5, Chopurov U1.5, Vagaev Dec, Oki ML, Steele Sub/Dec, Lucindo ML) priced at **+202,568 (2,026.68x)**.
* **Ticket Management**: Remove individual legs, clear tickets, export tickets to JSON, and formatted Print-to-PDF output.

### 4. Quantitative Differential Engine
* **50+ Feature Vectors per Matchup**:
  * Age Differential (highlighting the critical 6+ year age divergence trend)
  * Reach & Height Advantages
  * Elo Rating Gap
  * Takedown Average & Takedown Defense Percentage
  * Significant Strikes Landed per Minute & Strike Absorption Rate
  * Win Streaks and Octagon Experience
* **Automated Historical Trend Detection**: Identifies empirical betting trends (e.g. older veteran vs. undefeated debutant performance, home-region Abu Dhabi advantages).

### 5. Master Data Cheat Sheet
* Searchable and sortable master table containing every bout, weight division, fighter records, and model probabilities.
* Includes one-click CSV export for offline research and spreadsheet analysis.

### 6. Obsidian Matte Design System
* Engineered with a focused martial-arts palette: obsidian black background (`#08090b`), championship gold accents (`#d4af37`), neon cyan data highlights (`#00f0ff`), and emerald positive-return accents (`#10b981`).
* Full responsive support across desktop displays, tablets, and mobile smartphones with a slide-out ticket drawer.

---

## File Structure

```
UFC-333/
├── .gitignore                   # Git ignore rules for system, cache, and IDE files
├── .nojekyll                    # Instructs GitHub Pages to bypass Jekyll processing
├── README.md                    # Project documentation and attribution
├── index.html                   # Single-page application shell and layouts
├── styles.css                   # Obsidian matte design system and responsive styles
├── app.js                       # Application controller, Kelly math, and event logic
├── data.js                      # Bout dataset, fighter profiles, and model metrics
├── images/                      # Fighter portrait photography (28 transparent PNGs)
└── UFC-Elo-Engine/              # Historical Elo ranking engine and scraper (by NBAtrev)
    ├── ufceloengine.py          # Baseline Elo rating calculation script
    ├── ufcstatswebscraper.py    # Career fight history web scraper
    ├── ufc_fights.csv           # Historical fight results dataset
    └── README.md                # Elo engine documentation and YouTube link
```

---

## Local Setup & Development

To run the application locally on your computer:

### Option 1: Python HTTP Server (Recommended)
Open your terminal in this directory and start a local server:

```bash
# Python 3
python -m http.server 8080
```

Open your browser and navigate to:
```
http://localhost:8080/
```

### Option 2: VS Code Live Server
1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension by Ritwick Dey.
3. Right-click `index.html` and click **"Open with Live Server"**.

### Option 3: Direct Browser Launch
Because the app uses zero build tools and loads assets using relative paths, you can also double-click `index.html` to open it directly in modern web browsers (Chrome, Edge, Firefox, Safari).

---

## GitHub Pages Deployment Guide

Deploy this project to your personal GitHub Pages site in under two minutes:

### Step 1: Initialize Git and Commit
Open PowerShell or your command prompt in this project folder:

```bash
git init
git add .
git commit -m "Deploy UFC 333 Analytics Matrix to GitHub Pages"
git branch -M main
```

### Step 2: Create a GitHub Repository
1. Go to [GitHub](https://github.com/new) and create a new public repository (e.g., `ufc-333-analytics`).
2. Do **not** initialize with a README, .gitignore, or license (these already exist locally).

### Step 3: Push to GitHub
Link your remote repository and push your branch:

```bash
git remote add origin https://github.com/oscarbrimelow/UFC333.git
git push -u origin main
```

### Step 4: Enable GitHub Pages
1. On GitHub, navigate to your repository's **Settings** tab.
2. Click on **Pages** in the left sidebar menu.
3. Under **Build and deployment**:
   * **Source**: Select `Deploy from a branch`
   * **Branch**: Select `main`
   * **Folder**: Select `/ (root)`
4. Click **Save**.
5. Wait 1 to 2 minutes. GitHub Pages will display your live URL:
   `https://oscarbrimelow.github.io/UFC333/`

*(The included `.nojekyll` file ensures GitHub Pages loads all folders and assets directly without running Jekyll).*

---

## Disclaimer

This dashboard and predictive models are for educational, research, and entertainment purposes only. Past statistical performance, machine learning predictions, and mathematical staking models do not guarantee future outcomes. Please wager responsibly and within your financial limits.
