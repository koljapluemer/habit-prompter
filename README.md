# Local-First Habits and Checks

A local-first habit tracker and task management app with a queue-based daily workflow. Built with Vue 3, TypeScript, and Dexie Cloud for optional sync across devices.

## Features

- **Queue-based workflow**: Daily queue presents habits, evaluations, and todos one at a time
- **Habit tracking**: Create recurring habits with customizable frequency (daily, every N days)
- **Self-evaluations**: Schedule reflection questions with text responses
- **Todo management**: Track tasks with progress updates
- **Priority system**: High-priority items appear first in the queue
- **Daily limits**: Set a daily completion target to maintain sustainable productivity
- **Smart cooldowns**: Skip items temporarily (10-minute cooldown) to avoid repetition
- **Local-first**: All data stored locally with IndexedDB via Dexie
- **Optional sync**: Dexie Cloud integration for cross-device synchronization

## Tech Stack

- Vue 3 with TypeScript
- Vite for build tooling
- Dexie.js for IndexedDB database
- Dexie Cloud for optional sync
- TailwindCSS 4 + DaisyUI for styling
- Vue Router for navigation
- Lucide icons

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
