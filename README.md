# Cashflow Code — CRE Calculator

> Model the real wealth, cashflow, and tax impact of commercial real estate vs. doing nothing — over a 20-year horizon.

**🌐 Live demo: [cashflow-calc.exe.xyz](https://cashflow-calc.exe.xyz/)**

A React calculator built for high-W-2 earners exploring the path to financial freedom through commercial real estate. It quantifies the **opportunity cost of inaction** by running side-by-side projections of "Take Action" (acquire properties at scale) vs. "Do Nothing" (keep paying full taxes), so you can see what's at stake in dollars rather than abstractions.

The model captures five wealth engines simultaneously — equity appreciation, cumulative cashflow, depreciation tax savings, tenant principal paydown, and the tax drag of the do-nothing path — plus an optional stocks-only baseline for comparison.

## Two modes

- **Simple** — two inputs (annual income, monthly freedom number) and an instant 1/3/5-year opportunity-cost view with a 20-year wealth chart.
- **Advanced** — full assumption controls: cap rate, depreciation, equity stake, forced/annual appreciation, refi cycle, tax + cashflow reinvestment, stock alternative, and more.

## Features

- **Opportunity-cost framing** — the headline number is the wealth gap between acting and waiting at your chosen horizon
- **"Where the gap comes from"** breakdown — equity appreciation, cumulative cashflow, tax savings (incl. banked future deductions), principal paydown, tax drag of doing nothing
- **Scale Without Your Capital** — shows how creative financing + redirected taxes + tenant principal can cover up to 100% of an acquisition
- **Bracket-accurate federal + state tax** model (2026 brackets, single filer)
- **REPS-aware depreciation** — W-2 sheltering during the buying phase, depreciation pool depletion across the hold
- **Wealth & cashflow charts** — 20-year trajectories with annotated reference lines (buying ends, freedom threshold)
- **"Other Optimizations"** — rolling refi cycle (configurable interval) and tax/cashflow reinvestment toggle
- **Stocks comparison at Y20** — emphasizing CRE and stocks are additive, not either-or
- Light / dark mode, responsive layout (mobile drawer + desktop sidebar)

## Tech stack

| Layer  | Library                      |
|--------|------------------------------|
| UI     | React 18 + Tailwind CSS      |
| Charts | Recharts                     |
| Build  | Vite                         |
| Tests  | Vitest + Testing Library     |
| Icons  | Lucide React                 |
| Deploy | Vercel                       |

## Getting started

Requires Node 18+.

```bash
git clone https://github.com/Cashflow-Code/demo-repository.git
cd demo-repository

npm install

npm run dev          # http://localhost:5173
npm test             # unit tests (projection, tax, fmt, EquityInput)
npm run build        # production build
npm run preview      # preview the production build locally
```

## Project structure

```
src/
  App.jsx                  # state + Advanced view layout
  main.jsx                 # React entry
  index.css                # Tailwind directives
  components/
    SimpleCalculator.jsx   # Simple-mode view
    Sidebar.jsx            # input controls (desktop)
    MobileSidebar.jsx      # input controls (mobile drawer)
    SidebarContent.jsx     # shared sidebar body
    WealthChart.jsx        # 20-year wealth trajectory
    CashflowChart.jsx      # 20-year monthly cashflow trajectory
    ChartTooltip.jsx       # custom Recharts tooltip
    EquityInput.jsx        # deal-control preset selector
    Slider.jsx, Switch.jsx # form primitives
    MetricTile.jsx, TotalBanner.jsx, ContrastBullet.jsx
    Logo.jsx
  utils/
    projection.js          # core financial model (computeProjection)
    tax.js                 # bracket-accurate federal + state tax engine
    fmt.js                 # number formatting (K / M / B notation)
  __tests__/
    projection.test.js, tax.test.js, fmt.test.js, EquityInput.test.jsx
```

## Core model

`computeProjection()` in [`src/utils/projection.js`](src/utils/projection.js) runs a year-by-year loop over the 20-year horizon:

1. Properties acquired at `propertiesPerYear` during `buyingYears`
2. Asset value grows by `forcedAppreciation`% in the year of purchase, then `annualAppreciation`%/yr
3. Cashflow starts at `capRate × propertyValue` and grows at `cashflowGrowth`%/yr
4. 100% LTV loans amortize at `loanRate`% over `loanTerm` years; principal paydown is credited from the origination year
5. Depreciation pool depletes against W-2 income (bracket-accurate); REPS makes cashflow tax-free
6. Freedom threshold = the earliest year passive cashflow ≥ `enoughNumber`

## Deployment

Deploys to Vercel via [`vercel.json`](vercel.json). Pushes to `main` auto-deploy to [cashflow-calc.exe.xyz](https://cashflow-calc.exe.xyz/).

## Want to learn the strategy?

This calculator quantifies the math, but the playbook is the bigger story.

[**📘 Learn the full strategy at learn.cashflowcode.ai →**](https://learn.cashflowcode.ai)

## Recommended GitHub topics

When making the repo public, paste these into **Settings → Topics**:

```
commercial-real-estate  real-estate  cashflow-calculator  wealth-calculator
financial-modeling      passive-income  tax-strategy        depreciation
react                   vite            tailwindcss          recharts
financial-freedom
```

## License

[TBD]
