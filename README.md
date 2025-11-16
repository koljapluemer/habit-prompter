# Local-First Habits and Checks

A queue-based habit and task tracker. All data stored locally in IndexedDB with optional Dexie Cloud sync.

## Entity Types

The app manages 9 entity types, split into two categories:

### Prompts
- **prompt-text**: Recurring text prompt (shown every N days)
- **prompt-text-high-prio**: Text prompt shown daily before other items
- **prompt-yes-no**: Recurring yes/no/kind-of question

### Daily Tasks
- **daily-task-once**: Single task shown once
- **daily-task-once-delayed-until**: Single task starting on specific date
- **daily-task-once-delayed-by-days**: Single task delayed by N days
- **daily-task-repeated**: Recurring task (every N days)
- **daily-task-repeated-delayed-until**: Recurring task starting on specific date
- **daily-task-repeated-delayed-by-days**: Recurring task delayed by N days

## Queue Logic

The main queue processes entities in three phases:

1. **Phase 1**: All high-priority prompts (in random order)
2. **Phase 2**: Exactly one daily task (if any are due)
3. **Phase 3**: Regular prompts (infinite loop in random order)

## Tech Stack

- Vue 3 + TypeScript
- Vite
- Dexie.js (IndexedDB)
- Dexie Cloud (optional sync)
- Vue Router

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
