<template>
  <div class="screen">
    <p class="line">
      <span class="line-text uppercase">where do you want to navigate?</span>
    </p>

    <div class="button-row stacked">
      <RouterLink to="/" class="terminal-button">main</RouterLink>
      <RouterLink to="/task-of-the-day" class="terminal-button">task of the day</RouterLink>
      <RouterLink to="/actions" class="terminal-button">list</RouterLink>
      <RouterLink to="/entities/new" class="terminal-button">add entity</RouterLink>
      <RouterLink to="/settings" class="terminal-button">settings</RouterLink>
      <RouterLink to="/about" class="terminal-button">about</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
