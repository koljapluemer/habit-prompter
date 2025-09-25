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

    <!-- Todos Grid -->
    <div v-if="filteredTodos.length > 0" class="grid gap-4">
      <div
        v-for="todo in filteredTodos"
        :key="todo.id"
        class="card shadow-xl hover:shadow-2xl transition-shadow"
        :class="{
          'bg-base-100': !todo.completed,
          'bg-success/10 border border-success/20': todo.completed
        }"
      >
        <div class="card-body">
          <div class="flex justify-between items-start">
            <div class="flex-1 flex items-start gap-3">
              <button
                @click="toggleComplete(todo)"
                class="btn btn-circle btn-sm mt-1"
                :class="todo.completed ? 'btn-success' : 'btn-outline'"
              >
                <Check v-if="todo.completed" class="h-4 w-4" />
                <div v-else class="h-4 w-4"></div>
              </button>

              <div class="flex-1">
                <h3 class="card-title" :class="{ 'line-through opacity-60': todo.completed }">
                  {{ todo.title }}
                </h3>
                <p class="text-base-content/70 mb-2" :class="{ 'line-through opacity-60': todo.completed }">
                  {{ todo.description }}
                </p>

                <div class="flex gap-2 text-sm">
                  <div class="badge" :class="todo.doInstantly ? 'badge-success' : 'badge-secondary'">
                    {{ todo.doInstantly ? 'Do Instantly' : 'Schedule' }}
                  </div>
                  <div v-if="todo.completed && todo.completedAt" class="badge badge-outline">
                    Completed {{ formatDate(todo.completedAt) }}
                  </div>
                  <div v-if="todo.archived" class="badge badge-ghost">
                    Archived
                  </div>
                </div>

                <div class="text-sm mt-1 opacity-70">
                  Created {{ formatDate(todo.createdAt) }}
                </div>
              </div>
            </div>

            <div class="dropdown dropdown-end">
              <button tabindex="0" class="btn btn-ghost btn-sm btn-circle">
                <MoreVertical class="h-4 w-4" />
              </button>
              <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-xl">
                <li><a @click="editTodo(todo)">
                  <Edit class="h-4 w-4" />
                  Edit
                </a></li>
                <li v-if="!todo.archived && todo.completed">
                  <a @click="archiveTodo(todo)">
                    <Archive class="h-4 w-4" />
                    Archive
                  </a>
                </li>
                <li><a @click="deleteTodo(todo)" class="text-error">
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
            <label class="label">
              <span class="label-text">Description</span>
            </label>
            <textarea
              v-model="formData.description"
              placeholder="Additional details about this task..."
              class="textarea textarea-bordered w-full"
              rows="3"
            ></textarea>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Do instantly (vs schedule for later)</span>
              <input
                v-model="formData.doInstantly"
                type="checkbox"
                class="toggle toggle-success"
              />
            </label>
            <label class="label">
              <span class="label-text-alt">
                {{ formData.doInstantly ? 'This task can be completed immediately' : 'This task should be scheduled for later' }}
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
  CheckSquare, Plus, Clock, CheckCircle, Check, MoreVertical,
  Edit, Archive, Trash2
} from 'lucide-vue-next'

const todos = ref<Todo[]>([])
const activeFilter = ref<'active' | 'completed'>('active')
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingTodo = ref<Todo | null>(null)

const formData = ref({
  title: '',
  description: '',
  doInstantly: true
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
    description: todo.description,
    doInstantly: todo.doInstantly
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
    description: '',
    doInstantly: true
  }
}

onMounted(() => {
  loadTodos()
})
</script>