<template>
  <div>
    <!-- Header with Add Button -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-2">
        <RotateCcw class="h-8 w-8 text-primary" />
        <h2 class="text-2xl font-bold">Habits</h2>
      </div>
      <button @click="showAddForm = true" class="btn btn-primary">
        <Plus class="h-5 w-5" />
        Add Habit
      </button>
    </div>

    <!-- Habits Grid -->
    <div v-if="habits.length > 0" class="grid gap-4">
      <div
        v-for="habit in habits"
        :key="habit.id"
        class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
      >
        <div class="card-body">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="card-title">{{ habit.title }}</h3>
              <p class="text-base-content/70 mb-2">{{ habit.description }}</p>

              <div class="flex gap-4 text-sm">
                <div class="badge badge-outline">
                  Every {{ habit.minFrequencyDays }} day{{ habit.minFrequencyDays !== 1 ? 's' : '' }}
                </div>
                <div v-if="habit.isHighPrio" class="badge badge-error">
                  High Priority
                </div>
              </div>

              <div class="text-sm mt-2 opacity-70">
                Last completed: {{ habit.lastCompleted ? formatDate(habit.lastCompleted) : 'Never' }}
              </div>
            </div>

            <div class="dropdown dropdown-end">
              <button tabindex="0" class="btn btn-ghost btn-sm btn-circle">
                <MoreVertical class="h-4 w-4" />
              </button>
              <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-xl">
                <li><a @click="editHabit(habit)">
                  <Edit class="h-4 w-4" />
                  Edit
                </a></li>
                <li><a @click="deleteHabit(habit)" class="text-error">
                  <Trash2 class="h-4 w-4" />
                  Delete
                </a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="hero bg-base-200 rounded-box min-h-64">
      <div class="hero-content text-center">
        <div>
          <RotateCcw class="h-16 w-16 mx-auto mb-4 text-primary" />
          <h3 class="text-xl font-bold mb-4">No habits yet</h3>
          <p class="text-base-content/70 mb-6">
            Create your first habit to start building consistent routines
          </p>
          <button @click="showAddForm = true" class="btn btn-primary">Add Your First Habit</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <dialog class="modal" :class="{ 'modal-open': showAddForm || showEditForm }">
      <div class="modal-box w-11/12 max-w-2xl">
        <h3 class="text-lg font-bold mb-4">
          {{ editingHabit ? 'Edit Habit' : 'Add New Habit' }}
        </h3>

        <form @submit.prevent="saveHabit" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Title *</span>
            </label>
            <input
              v-model="formData.title"
              type="text"
              placeholder="e.g., Exercise for 30 minutes"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Description</span>
            </label>
            <textarea
              v-model="formData.description"
              placeholder="Details about this habit..."
              class="textarea textarea-bordered w-full"
              rows="3"
            ></textarea>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Minimum frequency (days) *</span>
            </label>
            <input
              v-model.number="formData.minFrequencyDays"
              type="number"
              min="1"
              placeholder="e.g., 1 for daily, 3 for every 3 days"
              class="input input-bordered w-full"
              required
            />
            <label class="label">
              <span class="label-text-alt">How often should this habit be done?</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">High Priority</span>
              <input
                v-model="formData.isHighPrio"
                type="checkbox"
                class="toggle toggle-error"
              />
            </label>
            <label class="label">
              <span class="label-text-alt">
                {{ formData.isHighPrio ? 'This habit will be prioritized in the queue' : 'This habit has normal priority' }}
              </span>
            </label>
          </div>

          <div class="modal-action">
            <button type="submit" class="btn btn-primary">
              {{ editingHabit ? 'Update' : 'Create' }} Habit
            </button>
            <button type="button" @click="cancelForm" class="btn">Cancel</button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { habitService } from '@/services/database'
import type { Habit } from '@/db'
import { RotateCcw, Plus, MoreVertical, Edit, Trash2 } from 'lucide-vue-next'

const habits = ref<Habit[]>([])
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingHabit = ref<Habit | null>(null)

const formData = ref({
  title: '',
  description: '',
  minFrequencyDays: 1,
  isHighPrio: false
})

const loadHabits = async () => {
  habits.value = await habitService.getAll()
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

const editHabit = (habit: Habit) => {
  editingHabit.value = habit
  formData.value = {
    title: habit.title,
    description: habit.description,
    minFrequencyDays: habit.minFrequencyDays,
    isHighPrio: habit.isHighPrio
  }
  showEditForm.value = true
}

const deleteHabit = async (habit: Habit) => {
  if (!confirm('Are you sure you want to delete this habit?')) return

  await habitService.delete(habit.id!)
  await loadHabits()
}

const saveHabit = async () => {
  try {
    const habitData = {
      ...formData.value,
      createdAt: new Date()
    }

    if (editingHabit.value) {
      await habitService.update(editingHabit.value.id!, formData.value)
    } else {
      await habitService.create(habitData)
    }

    await loadHabits()
    cancelForm()
  } catch (error) {
    console.error('Failed to save habit:', error)
    alert('Failed to save habit. Please try again.')
  }
}

const cancelForm = () => {
  showAddForm.value = false
  showEditForm.value = false
  editingHabit.value = null
  formData.value = {
    title: '',
    description: '',
    minFrequencyDays: 1,
    isHighPrio: false
  }
}

onMounted(() => {
  loadHabits()
})
</script>