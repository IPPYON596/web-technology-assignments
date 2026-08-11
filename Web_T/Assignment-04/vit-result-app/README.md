# VIT Semester Result — React SPA

A single-page React application that displays a VIT student's semester
result: student info, headline stats, a subject-wise marks table, and a
performance summary.

## Tech choices

- **Build tool:** [Vite](https://vitejs.dev/) (fast dev server, zero-config for React + CSS Modules)
- **Styling:** **CSS Modules** (`*.module.css` files, one per component) — scoped
  class names with no extra runtime dependency, works with Vite out of the box.
- **State:** React functional components with `useState` / `useEffect` / `useMemo`
- **File extensions:** any file that returns JSX uses `.jsx` (Vite's default JSX
  handling only applies to `.jsx`/`.tsx` out of the box). Plain data/logic
  files with no JSX (`resultData.js`, `gradeUtils.js`) stay `.js`.

## Project structure

```
vit-result-app/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── index.jsx                # ReactDOM root, mounts <App />
    ├── index.css                # global reset + design tokens (colors, fonts)
    ├── App.jsx                  # top-level layout, wires data → components
    ├── App.module.css
    ├── data/
    │   └── resultData.js        # raw student + subject marks
    ├── utils/
    │   └── gradeUtils.js        # total/grade/percentage calculations
    └── components/
        ├── Header.jsx / .module.css
        ├── StudentInfo.jsx / .module.css
        ├── StatsCards.jsx / .module.css
        ├── SubjectTable.jsx / .module.css
        ├── SubjectRow.jsx           (styled via SubjectTable.module.css)
        └── SummaryCard.jsx / .module.css
```

## How to run

1. Make sure you have **Node.js 18+** installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   Vite will print a local URL (usually `http://localhost:5173`) — open it in your browser.
4. To build a production bundle:
   ```bash
   npm run build
   ```
   Output goes to the `dist/` folder. Preview it locally with `npm run preview`.

## Editing the data

All source marks live in `src/data/resultData.js`. Change the student's
name/reg no/branch/semester, or edit the `subjects` array (each subject
just needs `mse` and `ese` raw marks) — every total, grade, percentage,
and summary stat recalculates automatically via `src/utils/gradeUtils.js`.

## Grading scale

| Total (MSE + ESE) | Grade |
|---|---|
| 90 – 100 | A |
| 80 – 89  | B |
| 70 – 79  | C |
| 60 – 69  | D |
| < 60     | F |

Overall percentage = (sum of all subject totals) / (subjects × 100) × 100.
