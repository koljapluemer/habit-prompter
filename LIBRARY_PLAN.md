# Vue + Dexie + Google Drive Backup Library Plan

## Overview

This plan outlines the extraction of the backup-to-google-drive functionality from this habits and checks app into a reusable library for other Vue + Dexie projects.

## Current Implementation Analysis

### Current Components
1. **GoogleAuth Service** (`src/services/googleAuth.ts`)
   - Google OAuth2 integration using Google Identity Services
   - Token management and refresh
   - User profile handling
   - Auto-backup scheduling

2. **GoogleDrive Service** (`src/services/googleDrive.ts`)
   - File upload/download to Google Drive
   - Folder management
   - Error handling for Drive API

3. **Backup Service** (`src/services/backup.ts`)
   - Data export/import logic
   - File format validation
   - Local file handling

4. **Database Integration** (`src/db/index.ts`)
   - Dexie database definition
   - Typed interfaces for data models

5. **UI Integration** (`src/views/SettingsView.vue`)
   - Vue component for backup management
   - User authentication flow
   - Settings management

## Library Design

### Package Structure
```
vue-dexie-gdrive-backup/
├── src/
│   ├── core/
│   │   ├── auth/
│   │   │   ├── GoogleAuthService.ts
│   │   │   └── types.ts
│   │   ├── drive/
│   │   │   ├── GoogleDriveService.ts
│   │   │   └── types.ts
│   │   ├── backup/
│   │   │   ├── BackupService.ts
│   │   │   └── types.ts
│   │   └── utils/
│   │       ├── validation.ts
│   │       └── storage.ts
│   ├── vue/
│   │   ├── composables/
│   │   │   ├── useGoogleAuth.ts
│   │   │   ├── useGoogleDrive.ts
│   │   │   └── useBackup.ts
│   │   └── components/
│   │       ├── BackupSettings.vue
│   │       ├── GoogleAuthButton.vue
│   │       └── BackupStatus.vue
│   ├── types/
│   │   ├── database.ts
│   │   └── config.ts
│   └── index.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

### Core API Design

#### 1. Database Schema Interface
```typescript
interface DatabaseSchema {
  tables: Record<string, {
    name: string
    primaryKey: string
    indexes?: string[]
    transform?: {
      export: (data: any) => any
      import: (data: any) => any
    }
  }>
}

interface BackupConfig {
  databaseName: string
  schema: DatabaseSchema
  googleClientId: string
  appName: string
  backupFilename?: string
  folderName?: string
  version?: string
}
```

#### 2. Backup Service Interface
```typescript
interface BackupService {
  initialize(config: BackupConfig): Promise<void>
  exportData(): Promise<string>
  importData(jsonData: string): Promise<void>
  getStats(): Promise<BackupStats>
  validateBackupData(data: unknown): boolean
}
```

#### 3. Google Auth Service Interface
```typescript
interface GoogleAuthService {
  initialize(clientId: string): Promise<void>
  signIn(): Promise<GoogleUser>
  signOut(): Promise<void>
  getAccessToken(): Promise<string>
  isSignedIn(): boolean
  getUser(): GoogleUser | null
  updateAutoBackup(enabled: boolean): Promise<void>
}
```

#### 4. Google Drive Service Interface
```typescript
interface GoogleDriveService {
  initialize(authService: GoogleAuthService, config: DriveConfig): Promise<void>
  backup(data: string): Promise<void>
  restore(): Promise<string>
  findBackupFile(): Promise<string | null>
}
```

### Vue Composables

#### 1. useGoogleAuth
```typescript
function useGoogleAuth(config: AuthConfig) {
  const isConnected = ref(false)
  const user = ref<GoogleUser | null>(null)
  const isLoading = ref(false)

  const signIn = async () => { /* ... */ }
  const signOut = async () => { /* ... */ }
  const checkStatus = async () => { /* ... */ }

  return {
    isConnected: readonly(isConnected),
    user: readonly(user),
    isLoading: readonly(isLoading),
    signIn,
    signOut,
    checkStatus
  }
}
```

#### 2. useBackup
```typescript
function useBackup(config: BackupConfig) {
  const isBackingUp = ref(false)
  const isRestoring = ref(false)
  const lastBackup = ref<string | null>(null)
  const autoBackupEnabled = ref(false)

  const backup = async () => { /* ... */ }
  const restore = async () => { /* ... */ }
  const exportLocal = async () => { /* ... */ }
  const importLocal = async (file: File) => { /* ... */ }

  return {
    isBackingUp: readonly(isBackingUp),
    isRestoring: readonly(isRestoring),
    lastBackup: readonly(lastBackup),
    autoBackupEnabled,
    backup,
    restore,
    exportLocal,
    importLocal
  }
}
```

### Vue Components

#### 1. BackupSettings Component
```vue
<template>
  <div class="backup-settings">
    <GoogleAuthButton v-if="!auth.isConnected" @connect="auth.signIn" />
    <div v-else class="backup-controls">
      <BackupStatus :last-backup="backup.lastBackup" :auto-enabled="backup.autoBackupEnabled" />
      <button @click="backup.backup" :disabled="backup.isBackingUp">Backup Now</button>
      <button @click="backup.restore" :disabled="backup.isRestoring">Restore</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  config: BackupConfig
  // Optional styling props
  theme?: 'auto' | 'light' | 'dark'
  variant?: 'default' | 'compact' | 'detailed'
}
</script>
```

## Migration Strategy

### Phase 1: Core Library Extraction
1. **Extract Core Services**
   - Remove app-specific dependencies from auth, drive, and backup services
   - Make services configurable via interfaces
   - Add proper error handling and logging

2. **Create Generic Database Interface**
   - Abstract away app-specific database schema
   - Create configurable table mapping system
   - Add validation framework for different data types

3. **Package Setup**
   - Set up NPM package structure
   - Configure TypeScript build
   - Add proper peer dependencies (Vue 3, Dexie)

### Phase 2: Vue Integration Layer
1. **Create Composables**
   - Extract reactive state management from components
   - Add proper lifecycle management
   - Implement error boundaries

2. **Build Components**
   - Create unstyled, accessible components
   - Add slot-based customization
   - Support different UI frameworks (optional)

3. **Add Configuration System**
   - Environment-based configuration
   - Runtime configuration validation
   - Default value management

### Phase 3: Testing & Documentation
1. **Testing**
   - Unit tests for core services
   - Integration tests with mock Google APIs
   - E2E tests with sample Vue + Dexie apps

2. **Documentation**
   - API documentation
   - Integration guides
   - Migration guide from current implementation
   - Example projects

### Phase 4: Advanced Features
1. **Enhanced Backup Options**
   - Incremental backups
   - Multiple backup destinations
   - Compression and encryption

2. **Monitoring & Analytics**
   - Backup success/failure tracking
   - Performance metrics
   - Usage analytics (opt-in)

## Library Usage Example

### Installation
```bash
npm install vue-dexie-gdrive-backup
```

### Basic Setup
```typescript
// main.ts
import { createApp } from 'vue'
import { createBackupPlugin } from 'vue-dexie-gdrive-backup'

const app = createApp(App)

app.use(createBackupPlugin({
  databaseName: 'MyAppDB',
  googleClientId: 'your-client-id',
  appName: 'My App',
  schema: {
    tables: {
      users: { name: 'users', primaryKey: 'id' },
      posts: { name: 'posts', primaryKey: 'id' }
    }
  }
}))
```

### Component Usage
```vue
<template>
  <BackupSettings
    :config="backupConfig"
    theme="auto"
    variant="detailed"
    @backup-success="onBackupSuccess"
    @backup-error="onBackupError"
  />
</template>

<script setup lang="ts">
import { BackupSettings } from 'vue-dexie-gdrive-backup'

const backupConfig = {
  // ... configuration
}

const onBackupSuccess = () => {
  console.log('Backup completed!')
}
</script>
```

### Composable Usage
```vue
<script setup lang="ts">
import { useBackup, useGoogleAuth } from 'vue-dexie-gdrive-backup'

const auth = useGoogleAuth({ clientId: 'your-client-id' })
const backup = useBackup({
  databaseName: 'MyAppDB',
  schema: mySchema
})

// Custom UI with full control
</script>
```

## Technical Challenges

1. **Schema Complexity** - Different apps have vastly different database schemas
2. **UI Framework Coupling** - Current implementation is tightly coupled to DaisyUI/Tailwind
3. **Google API Changes** - Need to handle Google Drive API updates gracefully
4. **Bundle Size** - Keeping the library lightweight while feature-rich
5. **Configuration Complexity** - Balancing simplicity with flexibility

## Implementation Steps

1. **Proof of Concept** - Extract core services into a separate package
2. **API Design Review** - Validate interfaces with potential users
3. **Implementation** - Build the library following the proposed structure
4. **Testing** - Create comprehensive test suite
5. **Documentation** - Write integration guides and examples
6. **Release** - Publish to NPM with semantic versioning