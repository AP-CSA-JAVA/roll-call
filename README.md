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
2. On **Call on Someone**, choose a roster and a topic, then call.
3. Mark absent students **NP** under *Attendance*, or click *Not here* on a called student to mark NP and re-pick.
4. Set **Think time** (Off, 15, 30, 45, or 60 seconds; default 45) to give partners time to talk. The question appears with a countdown, and the student's name is revealed when the timer ends. You can pause the timer or show the name early.
5. Check **Pick each student only once** to stop repeats: each present student is picked once, across every quiz today, until you click **Reset picked students**. Unchecked, students can be picked repeatedly.

Question-bank CSV columns: `question, choiceA, choiceB, choiceC, choiceD, correct` (correct = A, B, C, or D).
