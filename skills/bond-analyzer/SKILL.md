---
name: bond-analyzer
description: "Bond Analysis Expert: Fetches bond data from Bondley API, scrapes tbliste, parses data, calculates yield/spread, and compares."
triggers:
  keywords: ["tahvil", "bond", "bondley", "tbliste", "yield", "getiri"]
auto_load_when: "User asks about a bond, requests tahvil analysis, or wants to compare Bondley and tbliste data"
agent: researcher
tools: ["Read", "Write", "Bash", "Browser"]
---

# Bond Analysis & Comparison Workflow

**Focus:** Automated data retrieval from Bondley API, scraping from external sources (tbliste), data parsing, financial calculation, and comparison reporting.

## 1. Authentication & Setup

**Core Endpoints & Sources:**
- **Bondley Web:** `https://bondley.one`
- **Bondley API:** `https://bondley.one`
- **BIST tbliste.zip:** `https://borsaistanbul.com/datum/tbliste.zip`
- **BIST TLREF Daily:** `https://borsaistanbul.com/datum/bisttlrefendeksi.csv`
- **BIST TLREF Historical:** `https://borsaistanbul.com/datum/BISTTLREFENDEKSI_D.zip`

```
Before starting the analysis:
1. Verify Environment Variables: Ensure necessary credentials for Bondley API (e.g., BONDLEY_API_KEY) and tbliste are available in `.env` or system environment.
2. If credentials are not found, pause and explicitly ask the USER to provide them securely.
3. Setup temporary workspace: Create a `scratch/` directory if needed to store raw JSON responses or HTML dumps for parsing.
```

## 2. Step-by-Step Data Collection

### A. Bondley API Retrieval
1. Identify the target bond identifier (ISIN or ticker) provided by the user.
2. The Bondley API provides multiple endpoints for retrieving bond data. All endpoints require a valid Bearer Token for authentication.
   - **List/Search Bonds (`GET /api/v1/bonds/`)**: 
     - Query parameters: `search` (ISIN or issuer), `currency`, `security_type`, `yield_type`, `max_days_to_maturity`, `min_spread`, `order_by` (e.g., `spread_desc`).
   - **Bond Detail (`GET /api/v1/bonds/{isin_code}`)**: 
     - Returns bond details, calculated metrics (YTM, Dirty/Clean Price, Duration), and KAP disclosures.
     - Optional query param: `settlement_date` (YYYY-MM-DD).
   - **Bond History (`GET /api/v1/bonds/{isin_code}/history`)**: 
     - Returns historical clean price and YTM.
     - Query param: `days` (7-365, default 90).
   - **Scenario Analysis (`GET /api/v1/bonds/{isin_code}/scenario`)**: 
     - Returns shock scenario analysis.
     - Query param: `tlref_shock_bp` (integer, e.g., 50 for +50bps), `settlement_date`.
   - **Market Stats & Yield Curve**: `GET /api/v1/bonds/stats` and `GET /api/v1/bonds/yield-curve`.
3. Use the `read_url_content` or `curl` to fetch data with the Authorization header. Extract key metrics: Clean Price, Dirty Price, Yield to Maturity (YTM), Coupon Rate, Maturity Date, Modified Duration.

### B. Tbliste & External Links Scraping
1. Target the specific Borsa Istanbul data URLs (e.g., `https://borsaistanbul.com/datum/tbliste.zip` or TLREF files) depending on the analysis scope.
2. **Tool Selection:**
   - If the site is static: Use `read_url_content`.
   - If the site requires login, JavaScript rendering, or interaction: Start a **Browser Subagent** (`browser_subagent`) to navigate, login if necessary, and extract the required table data.
3. Extract the same key metrics for the target ISIN for comparison.

## 3. Parsing & Financial Calculation

```
Execution:
1. Parse the retrieved JSON/HTML data using a quick Python or Node.js scratch script.
2. Calculate Discrepancies (Spread):
   - Price Difference = Bondley Price - Tbliste Price
   - Yield Spread = Bondley YTM - Tbliste YTM
3. Ensure date formats are aligned and normalized before calculation.
```

## 4. Reporting & Comparison Output

Present the final analysis to the user using an **Artifact** (Markdown format). 
The report MUST include:

1. **Executive Summary:** A brief conclusion on the bond's status and data reliability.
2. **Comparison Table:**
   | Metric | Bondley API | Tbliste | Difference / Spread |
   |--------|-------------|---------|---------------------|
   | Clean Price | ... | ... | ... |
   | Yield (YTM) | ... | ... | ... |
3. **Raw Data References:** Links or brief snippets of the raw data sources used.

## Quick Reference / Rules

- **NEVER** expose raw API keys or passwords in the final output.
- **ALWAYS** validate the ISIN format before making API calls.
- If the browser subagent fails to find the bond on tbliste, fallback to alternative public financial data sources if applicable, or inform the user immediately.
