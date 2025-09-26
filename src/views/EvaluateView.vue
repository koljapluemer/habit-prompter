<template>
  <div>
    <!-- Header with Add Button -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-2">
        <Brain class="h-8 w-8 text-warning" />
        <h2 class="text-2xl font-bold">Evaluate</h2>
      </div>
      <button @click="showAddForm = true" class="btn btn-warning">
        <Plus class="h-5 w-5" />
        Add Evaluation
      </button>
    </div>

    <!-- Evaluations Table -->
    <div v-if="evaluates.length > 0" class="card bg-base-100 shadow-xl">
      <div class="card-body p-0">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Frequency</th>
                <th>Priority</th>
                <th>Last Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="evaluate in evaluates" :key="evaluate.id" class="hover">
                <td>
                  <div class="font-medium">{{ evaluate.question }}</div>
                </td>
                <td>
                  <div class="badge badge-outline">
                    Every {{ evaluate.minFrequencyDays }} day{{ evaluate.minFrequencyDays !== 1 ? 's' : '' }}
                  </div>
                </td>
                <td>
                  <div v-if="evaluate.isHighPrio" class="badge badge-error">High Priority</div>
                  <div v-else class="text-base-content/70">Normal</div>
                </td>
                <td>
                  <div class="text-sm">
                    {{ evaluate.lastCompleted ? formatDate(evaluate.lastCompleted) : 'Never' }}
                  </div>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button @click="editEvaluate(evaluate)" class="btn btn-ghost btn-sm">
                      <Edit class="h-4 w-4" />
                      Edit
                    </button>
                    <button @click="deleteEvaluate(evaluate)" class="btn btn-ghost btn-sm text-error">
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
          <Brain class="h-16 w-16 mx-auto mb-4 text-warning" />
          <h3 class="text-xl font-bold mb-4">No evaluations yet</h3>
          <p class="text-base-content/70 mb-6">
            Create your first evaluation to start reflecting on your progress
          </p>
          <button @click="showAddForm = true" class="btn btn-warning">Add Your First Evaluation</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <dialog class="modal" :class="{ 'modal-open': showAddForm || showEditForm }">
      <div class="modal-box w-11/12 max-w-2xl">
        <h3 class="text-lg font-bold mb-4">
          {{ editingEvaluate ? 'Edit Evaluation' : 'Add New Evaluation' }}
        </h3>

        <form @submit.prevent="saveEvaluate" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Question *</span>
            </label>
            <input
              v-model="formData.question"
              type="text"
              placeholder="e.g., How satisfied are you with your exercise routine?"
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
              placeholder="e.g., 7 for weekly, 30 for monthly"
              class="input input-bordered w-full"
              required
            />
            <label class="label">
              <span class="label-text-alt">How often should you reflect on this?</span>
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
                {{ formData.isHighPrio ? 'This evaluation will be prioritized in the queue' : 'This evaluation has normal priority' }}
              </span>
            </label>
          </div>

          <div class="modal-action">
            <button type="submit" class="btn btn-warning">
              {{ editingEvaluate ? 'Update' : 'Create' }} Evaluation
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
import { evaluateService } from '@/services/database'
import type { Evaluate } from '@/db'
import { Brain, Plus, Edit, Trash2 } from 'lucide-vue-next'

const evaluates = ref<Evaluate[]>([])
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingEvaluate = ref<Evaluate | null>(null)

const formData = ref({
  question: '',
  minFrequencyDays: 7,
  isHighPrio: false
})

const loadEvaluates = async () => {
  evaluates.value = await evaluateService.getAll()
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

const editEvaluate = (evaluate: Evaluate) => {
  editingEvaluate.value = evaluate
  formData.value = {
    question: evaluate.question,
    minFrequencyDays: evaluate.minFrequencyDays,
    isHighPrio: evaluate.isHighPrio
  }
  showEditForm.value = true
}

const deleteEvaluate = async (evaluate: Evaluate) => {
  if (!confirm('Are you sure you want to delete this evaluation?')) return

  await evaluateService.delete(evaluate.id!)
  await loadEvaluates()
}

const saveEvaluate = async () => {
  try {
    const evaluateData = {
      ...formData.value,
      createdAt: new Date()
    }

    if (editingEvaluate.value) {
      await evaluateService.update(editingEvaluate.value.id!, formData.value)
    } else {
      await evaluateService.create(evaluateData)
    }

    await loadEvaluates()
    cancelForm()
  } catch (error) {
    console.error('Failed to save evaluation:', error)
    alert('Failed to save evaluation. Please try again.')
  }
}

const cancelForm = () => {
  showAddForm.value = false
  showEditForm.value = false
  editingEvaluate.value = null
  formData.value = {
    question: '',
    minFrequencyDays: 7,
    isHighPrio: false
  }
}

onMounted(() => {
  loadEvaluates()
})
</script>