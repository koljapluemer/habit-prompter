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

    <!-- Evaluations Grid -->
    <div v-if="evaluates.length > 0" class="grid gap-4">
      <div
        v-for="evaluate in evaluates"
        :key="evaluate.id"
        class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
      >
        <div class="card-body">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="card-title">{{ evaluate.question }}</h3>
              <p class="text-base-content/70 mb-2">{{ evaluate.description }}</p>

              <div class="flex gap-4 text-sm">
                <div class="badge badge-outline">
                  Every {{ evaluate.minFrequencyDays }} day{{ evaluate.minFrequencyDays !== 1 ? 's' : '' }}
                </div>
                <div class="badge" :class="evaluate.doInstantly ? 'badge-warning' : 'badge-secondary'">
                  {{ evaluate.doInstantly ? 'Do Instantly' : 'Schedule' }}
                </div>
              </div>

              <div class="text-sm mt-2 opacity-70">
                Last completed: {{ evaluate.lastCompleted ? formatDate(evaluate.lastCompleted) : 'Never' }}
              </div>
            </div>

            <div class="dropdown dropdown-end">
              <button tabindex="0" class="btn btn-ghost btn-sm btn-circle">
                <MoreVertical class="h-4 w-4" />
              </button>
              <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-xl">
                <li><a @click="editEvaluate(evaluate)">
                  <Edit class="h-4 w-4" />
                  Edit
                </a></li>
                <li><a @click="deleteEvaluate(evaluate)" class="text-error">
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
              <span class="label-text">Description</span>
            </label>
            <textarea
              v-model="formData.description"
              placeholder="Additional context or notes about this evaluation..."
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
              <span class="label-text">Do instantly (vs schedule for later)</span>
              <input
                v-model="formData.doInstantly"
                type="checkbox"
                class="toggle toggle-warning"
              />
            </label>
            <label class="label">
              <span class="label-text-alt">
                {{ formData.doInstantly ? 'This evaluation can be completed immediately' : 'This evaluation should be scheduled for later' }}
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
import { Brain, Plus, MoreVertical, Edit, Trash2 } from 'lucide-vue-next'

const evaluates = ref<Evaluate[]>([])
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingEvaluate = ref<Evaluate | null>(null)

const formData = ref({
  question: '',
  description: '',
  minFrequencyDays: 7,
  doInstantly: true
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
    description: evaluate.description,
    minFrequencyDays: evaluate.minFrequencyDays,
    doInstantly: evaluate.doInstantly
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
    description: '',
    minFrequencyDays: 7,
    doInstantly: true
  }
}

onMounted(() => {
  loadEvaluates()
})
</script>