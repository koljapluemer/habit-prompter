<template>
  <div class="screen">
    <p class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">Made with &lt;3 by Kolja Sam</span>
    </p>
    <div class="button-row nav-row">
      <RouterLink to="/menu" class="terminal-button">Menu</RouterLink>
      <RouterLink to="/" class="terminal-button">Main</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
