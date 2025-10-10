<template>
  <div class="screen">
    <p class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">Where do you want to navigate?</span>
    </p>

    <div class="button-row stacked">
      <RouterLink to="/" class="terminal-button">Main</RouterLink>
      <RouterLink to="/actions" class="terminal-button">List</RouterLink>
      <RouterLink to="/actions/new" class="terminal-button">Add Action</RouterLink>
      <RouterLink to="/settings" class="terminal-button">Settings</RouterLink>
      <RouterLink to="/about" class="terminal-button">About</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
