# StockDash: Objective Stock Insights Dashboard

## Project Overview
A web-based dashboard for monitoring trending stocks and analyzing them through objective numerical data and technical indicators. The focus is on clarity, speed, and data-driven decision-making, avoiding news-heavy interfaces.

## Core Features
1.  **Trending Stocks Grid:** A high-level overview of stocks with significant price movements or volume spikes.
2.  **Key Metrics Panel:** Detailed numerical data for a selected stock (P/E Ratio, Market Cap, 52-week High/Low, EPS).
3.  **Technical Indicators:** Visual representation of RSI, Moving Averages (MA50, MA200) to gauge "trending" status objectively.
4.  **Interactive Charts:** Clean price action charts (Candlestick or Line).
5.  **Watchlist:** Ability to track specific stocks of interest.

## Tech Stack
- **Frontend:** React (TypeScript) for a robust UI state management.
- **Styling:** Vanilla CSS for a custom, modern "Dark Mode" financial aesthetic.
- **Data Visualization:** Chart.js or lightweight SVG-based charts.
- **Data Source:** Financial Modeling Prep API or Alpha Vantage (simulated with realistic mock data for the initial prototype to ensure immediate functionality).

## Design Philosophy
- **"Data First":** High contrast for numbers, color-coded price movements (Red/Blue or Green/Red depending on preference, likely Red/Blue for Korean market standard).
- **Minimalist:** No distractions, just the numbers and their trends.
- **Responsive:** Fluid layout for desktop and tablet monitoring.

## Implementation Phases
1.  **Phase 1: Foundation.** Setup React structure and basic layout components.
2.  **Phase 2: Data Layer.** Implement data fetching/simulation and state management for stock metrics.
3.  **Phase 3: Visualization.** Add charts and technical indicator displays.
4.  **Phase 4: Polish.** Refine the "Financial" aesthetic with professional typography and spacing.
