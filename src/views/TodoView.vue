<template>
  <div>
    <!-- Header with Add Button -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-2">
        <CheckSquare class="h-8 w-8 text-success" />
        <h2 class="text-2xl font-bold">Todos</h2>
      </div>
      <button @click="showAddForm = true" class="btn btn-success">
        <Plus class="h-5 w-5" />
        Add Todo
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="tabs tabs-boxed mb-6 w-fit">
      <a
        class="tab"
        :class="{ 'tab-active': activeFilter === 'active' }"
        @click="activeFilter = 'active'"
      >
        <Clock class="h-4 w-4 mr-1" />
        Active
      </a>
      <a
        class="tab"
        :class="{ 'tab-active': activeFilter === 'completed' }"
        @click="activeFilter = 'completed'"
      >
        <CheckCircle class="h-4 w-4 mr-1" />
        Completed
      </a>
    </div>

    <!-- Todos Table -->
    <div v-if="filteredTodos.length > 0" class="card bg-base-100 shadow-xl">
      <div class="card-body p-0">
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="todo in filteredTodos" :key="todo.id" class="hover">
                <td>
                  <button
                    @click="toggleComplete(todo)"
                    class="btn btn-circle btn-sm"
                    :class="todo.completed ? 'btn-success' : 'btn-outline'"
                  >
                    <Check v-if="todo.completed" class="h-4 w-4" />
                    <div v-else class="h-4 w-4"></div>
                  </button>
                </td>
                <td>
                  <div class="font-medium" :class="{ 'line-through opacity-60': todo.completed }">
                    {{ todo.title }}
                  </div>
                </td>
                <td>
                  <div v-if="todo.isHighPrio" class="badge badge-error">High Priority</div>
                  <div v-else class="text-base-content/70">Normal</div>
                </td>
                <td>
                  <div class="flex gap-2">
                    <div v-if="todo.completed && todo.completedAt" class="badge badge-success">
                      Completed {{ formatDate(todo.completedAt) }}
                    </div>
                    <div v-if="todo.archived" class="badge badge-ghost">
                      Archived
                    </div>
                  </div>
                </td>
                <td>
                  <div class="text-sm">
                    {{ formatDate(todo.createdAt) }}
                  </div>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button @click="editTodo(todo)" class="btn btn-ghost btn-sm">
                      <Edit class="h-4 w-4" />
                      Edit
                    </button>
                    <button v-if="!todo.archived && todo.completed" @click="archiveTodo(todo)" class="btn btn-ghost btn-sm">
                      <Archive class="h-4 w-4" />
                      Archive
                    </button>
                    <button @click="deleteTodo(todo)" class="btn btn-ghost btn-sm text-error">
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
          <CheckSquare class="h-16 w-16 mx-auto mb-4 text-success" />
          <h3 class="text-xl font-bold mb-4">
            {{ activeFilter === 'completed' ? 'No completed todos yet' : 'No active todos' }}
          </h3>
          <p class="text-base-content/70 mb-6">
            {{ activeFilter === 'completed'
              ? 'Complete some tasks to see them here'
              : 'Create your first todo to get organized'
            }}
          </p>
          <button
            v-if="activeFilter === 'active'"
            @click="showAddForm = true"
            class="btn btn-success"
          >
            Add Your First Todo
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <dialog class="modal" :class="{ 'modal-open': showAddForm || showEditForm }">
      <div class="modal-box w-11/12 max-w-2xl">
        <h3 class="text-lg font-bold mb-4">
          {{ editingTodo ? 'Edit Todo' : 'Add New Todo' }}
        </h3>

        <form @submit.prevent="saveTodo" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Title *</span>
            </label>
            <input
              v-model="formData.title"
              type="text"
              placeholder="e.g., Call dentist for appointment"
              class="input input-bordered w-full"
              required
            />
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
                {{ formData.isHighPrio ? 'This task will be prioritized in the queue' : 'This task has normal priority' }}
              </span>
            </label>
          </div>

          <div class="modal-action">
            <button type="submit" class="btn btn-success">
              {{ editingTodo ? 'Update' : 'Create' }} Todo
            </button>
            <button type="button" @click="cancelForm" class="btn">Cancel</button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { todoService } from '@/services/database'
import type { Todo } from '@/db'
import {
  CheckSquare, Plus, Clock, CheckCircle, Check,
  Edit, Archive, Trash2
} from 'lucide-vue-next'

const todos = ref<Todo[]>([])
const activeFilter = ref<'active' | 'completed'>('active')
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingTodo = ref<Todo | null>(null)

const formData = ref({
  title: '',
  isHighPrio: false
})

const filteredTodos = computed(() => {
  return todos.value.filter(todo => {
    if (activeFilter.value === 'completed') {
      return todo.completed
    } else {
      return !todo.completed && !todo.archived
    }
  })
})

const loadTodos = async () => {
  todos.value = await todoService.getAll()
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

const toggleComplete = async (todo: Todo) => {
  if (todo.completed) {
    // Mark as incomplete - reset completedAt
    await todoService.update(todo.id!, { completed: false, completedAt: undefined })
  } else {
    // Mark as complete
    await todoService.markCompleted(todo.id!)
  }
  await loadTodos()
}

const editTodo = (todo: Todo) => {
  editingTodo.value = todo
  formData.value = {
    title: todo.title,
    isHighPrio: todo.isHighPrio
  }
  showEditForm.value = true
}

const archiveTodo = async (todo: Todo) => {
  if (!confirm('Archive this completed todo?')) return

  await todoService.markArchived(todo.id!)
  await loadTodos()
}

const deleteTodo = async (todo: Todo) => {
  if (!confirm('Are you sure you want to delete this todo?')) return

  await todoService.delete(todo.id!)
  await loadTodos()
}

const saveTodo = async () => {
  try {
    const todoData = {
      ...formData.value,
      completed: false,
      archived: false,
      createdAt: new Date()
    }

    if (editingTodo.value) {
      await todoService.update(editingTodo.value.id!, formData.value)
    } else {
      await todoService.create(todoData)
    }

    await loadTodos()
    cancelForm()
  } catch (error) {
    console.error('Failed to save todo:', error)
    alert('Failed to save todo. Please try again.')
  }
}

const cancelForm = () => {
  showAddForm.value = false
  showEditForm.value = false
  editingTodo.value = null
  formData.value = {
    title: '',
    isHighPrio: false
  }
}

onMounted(() => {
  loadTodos()
})
</script>