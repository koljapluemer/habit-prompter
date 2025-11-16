I want to change how we split up habits, todos, and so on.
Curently, we call everything `Action` and adding a new one in `src/views/AddActionView.vue` is quite tedious, because they are quite a few optional fields and so on.

Let's make a bunch of separate entities instead; the user first has to select which, but then the actual input is way faster.

Each of these should have the props `createdAt`, `lastShownAt` and `answers[]` (this may vary in the exact type, or maybe we can abstract it smartly)

## Prompt: Text

two data fields: `prompt` and `interval`.

Shows up as the `prompt` and a textarea answer box. The answer should be persisted w/ timestamp.
The only button is "Submit", greyed out until at least one char in the textarea

## Prompt: Text High Prio

just `prompt`.

Apart from that, same as above. Will automatically show up daily and first, as seen later.

## Prompt: YesOrNo

two data fields: `question` and `interval`.

Show the question and three buttons, "no", "kind of", "yes". Persist timestamped answer.
Should not be picked again until interval has passed

## Daily Task: Once

one data field: `content` (and hidden `isDone`, which is for soft deletion)

Shows up as `content` and two buttons: "Already Done" and "OK".
Persist answers.
When "already done" pressed, soft delete and do not show in the future (exact context for when to show this will come apparent)

## Daily Task: Once, DelayedUntil

two data fields: `content`, and `startAtDate` (and the `isDone`)

Works exactly as above, only cannot be picked until the chosen date.
To stay within the UI paradigm, tell the user to input the date as yy-mm-dd (no date picker)

## Daily Task: Once, DelayedByDays

Works as above, except the user can input the delay in days instead of as a date so we persist `startInDays` instead of the date prop.

## Daily Task: Repeated

`content`, `interval`

## Daily Task: Repeated, DelayedUntil

should be obvious

## Daily Task: Repeated, DelayedByDays

should be obvious

# Main View

Based on this, obviously we need new add/edit structures, with clean architecture please, and db changes.
But also, we want to change how `src/views/MainView.vue` works.
Get rid of the daily limit settable [here](src/views/SettingsView.vue), it's not meaningful anymore.

Instead, main view every day should work like this:

1. Go through all `prompt: text high prio` tasks
2. Pick exactly ONE valid `daily task`, and show it
3. After that, infinite loop (or rather, until we run out of due ones) of the other `prompt` tasks (except high prio ones)
