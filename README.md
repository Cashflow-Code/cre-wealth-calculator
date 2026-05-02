# CRE Cashflow Calculator

A commercial real estate wealth projection tool that models five simultaneous return engines — cashflow, tax savings, equity appreciation, principal paydown, and inflation-adjusted debt devaluation — over a configurable 1–20 year horizon.

## What It Does

Given your income, deal structure, and investment assumptions, the calculator projects:

- **Opportunity cost** — the total wealth gap between taking action and doing nothing
- **Monthly passive cashflow** — growing year over year as you acquire properties
- **Tax savings** — W2 income sheltered via cost segregation and depreciation (REPS-aware)
- **Equity gain** — forced appreciation in year one, then compounding market growth
- **Principal paydown** — tenant-funded amortization credited from day one
- **Optimization scenarios** — rolling refi cycles (configurable interval) and tax/cashflow reinvestment with a three-way toggle (tax only / cashflow / both)

The app also models a stocks-only alternative for comparison and shows the point of financial freedom on both the wealth trajectory and monthly cashflow charts.

## Key Features

- **Five wealth engines** modeled simultaneously with bracket-accurate federal + state tax calculations
- **Realistic defaults** — 4% annual appreciation, 12% cap rate, 100% LTV creative financing
- **Rolling refi cycle** — configurable interval (2–10 years), tracks cumulative equity pulled to avoid double-counting
- **Tax & Cashflow Reinvestment** — toggle between redeploying tax savings, cashflow, or both into new CRE deals
- **Deal control presets** — knowledge (33%), capital (50%), systems (100%) equity splits
- **Depreciation deferral** — model year-one acceleration or multi-year ramp
- **Dual charts** — wealth trajectory and monthly cashflow, both with annotated reference lines (buying phase end, financial freedom threshold)
- **Light / dark mode**, responsive sidebar, year-picker (1Y / 3Y / 5Y horizon)

## Tech Stack

| Layer | Library |
|---|---|
| UI | React 18 + Tailwind CSS |
| Charts | Recharts |
| Build | Vite |
| Tests | Vitest + Testing Library |
| Icons | Lucide React |

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # run unit tests (53 tests)
npm run build      # production build
```

## Project Structure

```
src/
  App.jsx                  # Main layout, state, optimization calcs
  components/
    Sidebar.jsx            # All input controls
    WealthChart.jsx        # 20-year wealth trajectory (Recharts)
    CashflowChart.jsx      # Monthly cashflow comparison (Recharts)
    EquityInput.jsx        # Deal control preset selector
    MetricTile.jsx         # Reusable KPI tile
    ContrastBullet.jsx     # Styled bullet point
    ChartTooltip.jsx       # Custom chart tooltip
    Logo.jsx
  utils/
    projection.js          # Core financial model (computeProjection)
    tax.js                 # Bracket-accurate federal + state tax engine
    fmt.js                 # Number formatter
  __tests__/               # Unit tests for projection, tax, fmt, EquityInput
```

## Core Model

`computeProjection()` in `src/utils/projection.js` runs a year-by-year loop over the 20-year horizon:

1. Properties acquired at `propertiesPerYear` during `buyingYears`
2. Asset value grows at `forcedAppreciation`% in year one, then `annualAppreciation`%/yr
3. Cashflow starts at `capRate × propertyValue` and grows at `cashflowGrowth`%/yr
4. 100% LTV loans amortize at `loanRate`% over `loanTerm` years; principal paydown credited from the origination year
5. Depreciation pool depletes against W2 income (bracket-accurate); REPS makes cashflow tax-free
6. Freedom threshold calculation determines the earliest year passive cashflow exceeds `enoughNumber`

## Suggested Repository Name

`cre-cashflow-calculator`

Rename via **GitHub → Settings → Repository name** (requires owner access).
