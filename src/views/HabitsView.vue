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

    <!-- Habits Table -->
    <div v-if="habits.length > 0" class="card bg-base-100 shadow-xl">
      <div class="card-body p-0">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Frequency</th>
                <th>Priority</th>
                <th>Last Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="habit in habits" :key="habit.id" class="hover">
                <td>
                  <div class="font-medium">{{ habit.title }}</div>
                </td>
                <td>
                  <div class="badge badge-outline">
                    Every {{ habit.minFrequencyDays }} day{{ habit.minFrequencyDays !== 1 ? 's' : '' }}
                  </div>
                </td>
                <td>
                  <div v-if="habit.isHighPrio" class="badge badge-error">High Priority</div>
                  <div v-else class="text-base-content/70">Normal</div>
                </td>
                <td>
                  <div class="text-sm">
                    {{ habit.lastCompleted ? formatDate(habit.lastCompleted) : 'Never' }}
                  </div>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button @click="editHabit(habit)" class="btn btn-ghost btn-sm">
                      <Edit class="h-4 w-4" />
                      Edit
                    </button>
                    <button @click="deleteHabit(habit)" class="btn btn-ghost btn-sm text-error">
                      <Trash2 class="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
import { RotateCcw, Plus, Edit, Trash2 } from 'lucide-vue-next'

const habits = ref<Habit[]>([])
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingHabit = ref<Habit | null>(null)

const formData = ref({
  title: '',
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
    minFrequencyDays: 1,
    isHighPrio: false
  }
}

onMounted(() => {
  loadHabits()
})
</script>