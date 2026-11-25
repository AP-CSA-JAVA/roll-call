# Roll Call

A single-file classroom tool: load a class roster (type it or read it from a photo), load multiple-choice
question banks, and let it pick a random student and a random question. Tracks participation points and
attendance (NP = Not Present).

**Everything runs in the browser.** Rosters, question banks, points, and attendance are saved in that
browser's local storage on that computer. Nothing is uploaded to this repository or to any server.

## Keep this repository code-only

This repository is public (GitHub Pages on a free plan requires that). It should contain **only** the app:

- `index.html` — Roll Call
- `teams.html` — Roll Call Teams: Race Day (team race mode)
- `course-questions.js` — loads Check for Understanding questions from the course site (used by both pages)
- `README.md`, `README-google-signin.md`

**Do not commit question-bank CSV files, rosters, or exports here.** Anyone can read a public repository,
including the answer keys. Keep those files on your own computer, in Google Drive, or in a separate
**private** repository.

To make Git ignore them, add a file named `.gitignore` containing:

```
*.csv
```

## Using it

1. Open the published page and use the **Rosters** and **Question Banks** tabs to load your class and questions.
2. On **Call on Someone**, choose a roster and a topic, then call. The setup lives in three collapsed sections (**Choose questions**, **Attendance**, and **Options**); open one when you need it. Opening a section closes the others, and pressing Call closes them all. A one-line summary under the Call button shows the current roster, topic, questions on, NP count, and timer. In **Choose questions**, check or uncheck individual questions; only checked questions are asked.
3. Mark absent students **NP** under *Attendance*, or click *Not here* on a called student to mark NP and re-pick.
4. Under **Options**, set **Think time** (Off, 15, 30, 45, or 60 seconds; default 45) to give partners time to talk. The question appears with a countdown, and the student's name is revealed when the timer ends. You can pause the timer or show the name early.
5. Click the **gear** in the top-right corner to change the color theme (Forest Green, Midnight Blue, Charcoal & Orange, Deep Plum, Ocean Teal, or Classroom Light). The choice is remembered on that device.
6. Also under **Options**, check **Pick each student only once** to stop repeats: each present student is picked once, across every quiz today, until you click **Reset picked students**. Unchecked, students can be picked repeatedly.
7. Check **Students who miss stay in the pool (up to 2 tries)** (works with *Pick each student only once*). A student marked *Missed it* goes back on the list for another try today. A right answer, or a second miss, takes them off.
8. On the **Scoreboard**, **Question results** counts how many times each question was asked, how many were right or missed, and the percent right. **Export attempt log** downloads every answer (date, roster, topic, question, student, right/missed) as a CSV. The attempt log is stored in the browser like everything else; Google Sync does not carry it yet, so export it if you want a backup.

Question-bank CSV columns: `question, choiceA, choiceB, choiceC, choiceD, correct` (correct = A, B, C, or D).

## Roll Call Teams: Race Day (`teams.html`)

Team race version: 2-10 teams of 2-5 students; a right answer moves the team's car ahead, a wrong one
moves it back. It reads the same question-bank CSVs as Roll Call. Published at
`https://ap-csa-java.github.io/roll-call/teams.html`. Optional teacher sign-in: see `README-google-signin.md`.

## Shared color theme

Roll Call, Race Day and the Teacher Hub (`ap-csa-java.github.io/hub/`) share one theme choice, saved in
the browser key `rc_theme`. Pick a theme in any of them and the others match on that computer.
Race Day's custom colors stay on Race Day only.

## Course questions (Check for Understanding)

Both pages have a **Course questions…** button (Roll Call: *Question Banks* tab; Race Day: *Question bank* card).
Type sections or a range (`1.01-1.05`, `2.03, 2.04`, `3` for all of Unit 3) or tap sections, then **Load questions**.

- Questions are read live from the course site pages (`ap-csa-java.github.io/CSA_JAVA-Course/...`), so new CFU
  questions appear automatically. Nothing is copied into this repo.
- Only one-answer multiple choice with 2-4 choices is used. Fill-in/output, select-all and 5-6 choice questions are skipped.
- Answer choices are shuffled each time a set is loaded.
- A range includes lettered parts: `1.01-1.05` also brings in 1.01a and 1.01v. Unit 5's `5.1` is shown as `5.01`.
- In Race Day, each question's section (e.g. `2.04a`) is its topic, so **Accuracy by topic** shows results per section.
- If a unit page on the course site is renamed or a new unit page is added, update `PAGES` at the top of `course-questions.js`.
- It only works on the published site, not from a file opened on the computer.
