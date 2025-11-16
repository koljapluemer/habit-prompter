<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <main class="terminal">
      <RouterView />
    </main>
  </div>
</template>

<style>
:root {
  --background: #041b11;
  --foreground: #c6f5cf;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: 'Courier New', Courier, monospace;
  font-size: 20px;
}

a {
  color: inherit;
}

.app-shell {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
  padding: 3rem 1.5rem;
  overflow: hidden;
}

.terminal {
  width: min(960px, 100%);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.screen {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  overflow: hidden;
}

.line {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  letter-spacing: 0.03em;
}

.line-text {
  flex: 1;
}

.line-text.uppercase {
  text-transform: uppercase;
}

.prompt-symbol {
  color: var(--foreground);
  animation: blink 2s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.info {
  opacity: 0.75;
}

.flag {
  margin-left: 1rem;
  padding: 0.1rem 0.4rem;
  border: 1px solid var(--foreground);
  letter-spacing: 0.1em;
}

.interaction,
.input-stack,
.input-block,
.finish-block {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.line-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--foreground);
  font: inherit;
  caret-color: var(--foreground);
}

.line-input::placeholder {
  color: var(--foreground);
  opacity: 0.4;
}

.button-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.button-row.stacked {
  flex-direction: column;
  align-items: stretch;
}

.terminal-button {
  background: var(--background);
  color: var(--foreground);
  border: 1px solid var(--foreground);
  padding: 0.6rem 1.6rem;
  font: inherit;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  text-align: center;
}

.terminal-button:hover,
.terminal-button:focus-visible {
  background: var(--foreground);
  color: var(--background);
}

.terminal-button.disabled,
.terminal-button:disabled {
  text-decoration: line-through;
  opacity: 0.65;
  cursor: not-allowed;
  background: var(--background);
  color: var(--foreground);
}

.nav-row {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--foreground);
}

.action-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.list-entry {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--foreground);
  text-decoration: none;
  color: var(--foreground);
  transition: background 0.2s, color 0.2s;
}

.list-entry:hover,
.list-entry:focus-visible {
  background: var(--foreground);
  color: var(--background);
}

@media (max-width: 600px) {
  .app-shell {
    padding: 2rem 1rem;
  }

  .button-row {
    flex-direction: column;
  }
}
</style>
