<template>
  <div class="container mx-auto p-6 max-w-7xl">
    <div class="navbar bg-base-100 rounded-box shadow-lg mb-6">
      <div class="navbar-start">
        <router-link to="/" class="btn btn-ghost btn-circle">
          <ArrowLeft class="h-6 w-6" />
        </router-link>
        <div class="flex items-center gap-3 ml-4">
          <Settings class="h-8 w-8 text-primary" />
          <h1 class="text-3xl font-bold text-primary">Manage</h1>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs tabs-boxed mb-6 bg-base-100 shadow-lg">
      <router-link
        to="/manage/habits"
        class="tab"
        :class="{ 'tab-active': $route.name === 'manage-habits' }"
      >
        <RotateCcw class="h-4 w-4 mr-1" />
        Habits
      </router-link>
      <router-link
        to="/manage/evaluate"
        class="tab"
        :class="{ 'tab-active': $route.name === 'manage-evaluate' }"
      >
        <Brain class="h-4 w-4 mr-1" />
        Evaluate
      </router-link>
      <router-link
        to="/manage/todo"
        class="tab"
        :class="{ 'tab-active': $route.name === 'manage-todo' }"
      >
        <CheckSquare class="h-4 w-4 mr-1" />
        Todos
      </router-link>
    </div>

    <!-- Router View for Sub-components -->
    <RouterView />

    <!-- Default view when no subroute is active -->
    <div
      v-if="$route.name === 'manage'"
      class="hero bg-base-200 rounded-box min-h-96"
    >
      <div class="hero-content text-center">
        <div class="max-w-md">
          <Settings class="h-16 w-16 mx-auto mb-4 text-primary" />
          <h2 class="text-2xl font-bold mb-4">Choose a category</h2>
          <p class="text-base-content/70 mb-6">
            Select a category above to manage your habits, evaluations, or todos
          </p>
          <div class="flex gap-3 justify-center">
            <router-link to="/manage/habits" class="btn btn-primary">
              <RotateCcw class="h-4 w-4" />
              Habits
            </router-link>
            <router-link to="/manage/evaluate" class="btn btn-secondary">
              <Brain class="h-4 w-4" />
              Evaluate
            </router-link>
            <router-link to="/manage/todo" class="btn btn-accent">
              <CheckSquare class="h-4 w-4" />
              Todos
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ArrowLeft, Settings, RotateCcw, Brain, CheckSquare } from 'lucide-vue-next'
</script>