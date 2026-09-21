# Roll Call

A single-file classroom tool: load a class roster (type it or read it from a photo), load multiple-choice
question banks, and let it pick a random student and a random question. Tracks participation points and
attendance (NP = Not Present).

**Everything runs in the browser.** Rosters, question banks, points, and attendance are saved in that
browser's local storage on that computer. Nothing is uploaded to this repository or to any server.

## Keep this repository code-only

This repository is public (GitHub Pages on a free plan requires that). It should contain **only** the app:

- `index.html`
- `README.md`

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
