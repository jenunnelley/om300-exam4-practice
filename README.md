# OM 300 Exam 4 Practice Lab

A self-paced practice site for the cumulative OM 300 Exam 4 (final). It covers every chapter on the Exam 4 Terms and Topics list: 1, 2, 3, 4, 6, 6s, 7, 11, 12, and 16. Students answer story problems and concept questions right in the browser and get instant, specific feedback. There's nothing to install, no accounts, and nothing is sent anywhere.

It's built the same way as the Exam 3 Practice Lab and the OM 305 Excel Practice Lab.

## Put it online with GitHub Pages (about 10 minutes, free)

1. Go to **github.com** and sign in.
2. Click **+** (top right), then **New repository**. Name it `om300-exam4-practice`, choose **Public**, and click **Create repository**.
3. Click **uploading an existing file**.
4. Drag in these files: `index.html`, `app.js`, `problems.js`, `style.css`, `README.md`.
   (The `dev` and `.claude` folders are only for testing. Don't upload them.)
5. Click **Commit changes**.
6. Go to **Settings**, then **Pages**. Under **Branch**, choose **main** and **/ (root)**, then click **Save**.
7. Wait 1–2 minutes and refresh. Your link appears at the top, like `https://YOUR-USERNAME.github.io/om300-exam4-practice/`.
8. Open `blackboard-button.html` and `blackboard-intro.html`. If your link is different from the one in them, change it. Paste either one into a Blackboard item (HTML view).

## What's in it

**269 problems in 13 parts, 60 levels.** Every problem is a template, so **New numbers** gives a fresh version with new businesses, names, and numbers.

| Part | Topics |
|---|---|
| 1. Productivity (Ch. 1) | Labor productivity (workers × hours), percent change, new productivity after an increase, multifactor productivity (including labor cost from wages), multifactor % change |
| 2. OM, Strategy, Process & Capacity (Ch. 1, 2, 7) | OM definition, the 3 business functions, supply chain, the 10 strategic decisions, goods vs. services, service productivity, mission vs. strategy, differentiation/cost/response scenarios, product life cycle stages, outsourcing, the 4 process strategies, design/effective capacity and actual output, bottlenecks |
| 3. Project Management (Ch. 3) | Planning/scheduling/controlling, the project manager, ethics, the 6 CPM steps, ES/EF/LS/LF/slack definitions, and randomly generated networks: project duration, critical path, delays, ES/EF/LS/LF of an activity, slack, crash cost per period, which activity to crash first, cost to crash one period |
| 4. Forecasting Concepts (Ch. 4) | Time horizons and their uses, the 3 types of forecasts, the 4 qualitative methods, the quantitative methods, the 4 time-series components, MAD/MSE/MAPE meanings |
| 5. Forecasting Math (Ch. 4) | Naive, moving average, weighted moving average (decimal and whole-number weights), exponential smoothing (one step and chained), MAD, MSE, MAPE, comparing methods, trend projection (b, a, forecast, calendar-year trap), linear regression, seasonal indices and seasonal forecasts, trend × seasonality |
| 6. Quality & SPC Concepts (Ch. 6, 6s) | Quality definition, the 3 views, costs of quality, TQM and its 7 concepts, Six Sigma, JIT and quality, TQM tools, service quality, natural vs. assignable variation, sample size vs. number of samples, attribute vs. variable data, choosing a chart, run tests, process capability |
| 7. SPC Math (Ch. 6s) | A2/D4/D3 lookup by sample size, σx̄, x̄-chart limits with σ known (any z), "is it in control?", x̄̄ and R̄ (from a summary table or raw observations), x̄-chart limits with A2, R-chart limits, σp, p-chart limits (negative LCL → 0), p̄ from a table, c-chart limits |
| 8–13. Ch. 11, 12, 16 | Reused from the Exam 3 lab: supply chain concepts, supply chain math, inventory basics, EOQ & reorder point, EPQ, lean operations |

All new content (Parts 1–7) was written from the Ch. 1, 2, 3, 4, 6, 6s, and 7 lecture slides, the class examples and handouts, and the Exam 4 formula sheet. **No questions, scenarios, or names come from the Exam 4 versions**; they were used only to see the format and which topics get calculations.

## How it works for students

- **Number answers** are typed into a box ($ and commas allowed). Answers rounded to the requested decimals are accepted, plus a tiny tolerance for rounding in the middle steps.
- **Feedback names the mistake without giving the answer:** dividing by workers instead of labor-hours, dividing by the new value in a % change, adding every activity instead of taking the longest path, swapping ES and LS, putting the biggest weight on the oldest month, letting positive and negative errors cancel in MAD, squaring MAD instead of averaging squared errors, looking up A2 by the number of samples, using σ instead of σ ÷ √n, entering a p-chart rate as a percent, a negative LCL, using the EOQ formula on an EPQ problem, and many more.
- **Multiple choice** wrong answers explain what the chosen term actually means.
- **Hints** point toward the setup. After solving, the **worked solution** shows every step. After 3 misses, **Show me how** walks through it.
- **Testing out:** the first two problems in a level right on the first try, without hints, tests out of that level.
- **📝 Practice Final:** 35 random questions in the real exam's format: 15 calculations (4 points each, one from each calculation topic on the Exam 4 list) and 20 multiple choice (2 points each, spread across the chapters). It's timed at 120 minutes, one answer per question, with no feedback until submit. The results page shows the score out of 100, a by-topic breakdown, and every question with the correct answer and worked solution. Past scores are saved and appear in the progress report.
- **⚡ Speed Drills:** 8 questions against the clock (Productivity & CPM, Forecasting Math, SPC Math, Inventory & Supply Chain Math, Concepts Ch. 1–7, Concepts Ch. 11/12/16, Mixed Bag).
- **📘 Formulas & Tips:** every formula from the Exam 4 formula sheet by chapter, the inventory variable card, and eight traps to check every time.
- **My progress** shows a report students can copy and paste (for example, into a Blackboard submission) if you want proof of practice.

## Settings you can change

Open `app.js` on GitHub, click the pencil icon, and change the values near the top:

| Setting | What it does | Default |
|---|---|---|
| `LOCK_PARTS` | `true` = students must finish (or test out of) a part before the next opens | `false` |
| `JUMP_AHEAD` | Locked levels offer a one-shot jump-ahead challenge | `true` |
| `TEST_OUT_STREAK` | First-try answers in a row needed to test out of a level | `2` |
| `STRUGGLE_FAILS` / `STRUGGLE_HINTS` | Misses / hints on one problem before testing out turns off for that level | `3` / `2` |
| `SHOW_SOLUTION_AFTER` | Misses before "Show me how" appears | `3` |
| `NO_TEST_OUT_PARTS` | Parts where every problem is required | `[]` |
| `DRILL_LENGTH` | Questions per speed drill | `8` |
| `DRILL_SKIP_PENALTY` | Seconds added for skipping a drill question | `15` |
| `FINAL_MINUTES` | Practice final time limit | `120` |

## Good to know

- **The math was checked.** The self-test page builds every problem with 60 random seeds (16,140 versions) and checks that every answer is a real number, every worked solution and hint exists, every multiple-choice question has exactly one right answer, and no text shows "undefined" or "NaN." The formulas were also checked against the slide examples (Collins Title productivity, Milwaukee Paper crashing, the electrical power trend line, Super Cola x̄-chart) and the formula sheet's factor table.
- **Progress lives in each student's browser.** It doesn't follow them to another computer. You only see progress if they send you their report.
- **Answers are in the page's code.** A tech-savvy student could find them, so treat this as practice, not a test.
- **Browsers:** current Chrome, Edge, Firefox, and Safari. It works on phones too.

## For future edits (optional)

Problems live in `problems.js`. Each one is a small function that builds the story, the question, the answer, hints, worked steps, and a list of common wrong answers with a message for each. After adding or changing problems, run the self-test: from this folder, run `python -m http.server 8767`, then open `http://localhost:8767/dev/test.html`.
