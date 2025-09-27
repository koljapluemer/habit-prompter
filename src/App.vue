<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <div class="container mx-auto p-6 max-w-7xl">
      <div class="navbar bg-base-100 rounded-box shadow-lg mb-6 justify-center">
        <div class="flex gap-2">
          <router-link to="/" class="btn" :class="{ 'btn-active': $route.name === 'queue' }">Queue</router-link>
          <router-link to="/habits" class="btn" :class="{ 'btn-active': $route.name === 'habits' }">Habits</router-link>
          <router-link to="/eval" class="btn" :class="{ 'btn-active': $route.name === 'eval' }">Eval</router-link>
          <router-link to="/todos" class="btn" :class="{ 'btn-active': $route.name === 'todos' }">Todos</router-link>
        </div>
      </div>

      <RouterView />
    </div>
  </div>
</template>
