Let's change the design and structure of this habit prompter fundamentally, both in design and page structure.

## Design

- let's rip out daisy + tailwind, use our own custom css (just put in `App.vue` for now)
- orient the design on old computer terminals: two colors only (STRICTLY!!), a very light washed out green, and a very dark green
  - for examples, buttons should simply be a dark green rectangle (no shadows) with light green text on it
  - use monospace font
  - fairly large type, one font size in the whole app
  - screens/(pages) should usually be a prompt on top of the screen like "> where do you want to navigate to?" and if relevant a menu on the bottom, with buttons (next to each other on desktop, on top of each other on mobile)
  - input fields should be hidden (no input box), just "> " and a blinking cursor

## Data Structure

- let's kill the Evaluate/Todo/Habit split. Let's have a single entity `Action`
  - no backwards compatibility, assume db is reset and doesn't matter
  - give a boolean property `isFinishable` to `Action` (which effectively makes it a todo) and a `modality:Modality` which can be `do`, `schedule`, `answer`, `yes-no`, `one-to-ten` (this covers all other cases)

## Pages

### Main

- a "queue", with the same logic as right now, but VERY VERY minimal. Just show the habit in the prompt, and appropriate input/buttons
  - render appropriate ui according to the `modality`:
    - `do`: just show the action itself as prompt, buttons "Not Today", "Later", "Done"
    - `schedule`: show a line of text prompt "Schedule:", show the text input, and two buttons: "Skip" and "Done". Before text input is not at least 3 letters, deactive the done button (visualize via striketrhough effect on the btn text)
    - `answer`: exactly as above only with prompt "Answer"
    - `yes-no`: as above, no text input, instead 3 buttons "No", "Kind Of", "Yes"
    - `one-to-ten`: like `schedule` UI-wise, with the prompt "Rate from 1-10". Allow only numeric input (ideally actually just ignore other keypresses)
- if something is finishable, after answer, show another line "Is this task finished" and yes and no buttons

### Menu

- prompt "Where do you want to navigate" and standard buttons for all destinations

### List

- list all actions
- if one is hovered, it's inverted color-wise like a button
- clicking one leads to a screen listing the properties of that action with the buttons "Back", "Delete", "Edit"

### Add Action

- leads the user through screens creating a new action with the usual patterns: modality, content, interval, whether finishable, whether is high prio

### Edit Action

- same as above, only for every step show the current/previous value that the action has and the user can confirm an empty input which will leave the value unchanged

### About Page

For now just say "Made with <3 by Kolja Sam"
