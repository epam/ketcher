# Ketcher Settings Module

Centralized, platform-agnostic settings management for Ketcher.

---

## Quick Start

### Basic Usage

```typescript
import { SettingsService, LocalStorageAdapter } from 'ketcher-core';

// Initialize
const settingsService = new SettingsService({
  storage: new LocalStorageAdapter(),
  autoSave: true,
});
await settingsService.init();

// Get settings (flat structure)
const settings = settingsService.getSettings();
console.log(settings.rotationStep); // 15

// Update settings (flat structure)
await settingsService.updateSettings({
  rotationStep: 30,
  atomColoring: false,
});

// Load preset
await settingsService.loadPreset('acs');

// Subscribe to changes
const unsubscribe = settingsService.subscribe((newSettings) => {
  console.log('Settings changed:', newSettings);
});
```

### React Hook Usage

```typescript
import { useSettings } from 'ketcher-react';

function MyComponent() {
  const {
    settings,
    updateSettings,
    loadPreset,
  } = useSettings();

  const handleUpdate = async () => {
    await updateSettings({
      resetToSelect: false
    });
  };

  return <div>Rotation: {settings?.rotationStep}</div>;
}
```

---

## Architecture

```
 SettingsService
├── Storage (LocalStorage/Memory)
├── Validator (Ajv Schema)
├── Migration (Legacy → Current)
└── Events (Subscribe/Notify)
```

---

## Features

- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Validated** - Ajv schema validation
- ✅ **Persistent** - Auto-save to storage
- ✅ **Reactive** - Event-driven updates
- ✅ **Migrated** - Automatic legacy format migration
- ✅ **Immutable** - Frozen getters prevent mutations
- ✅ **Extensible** - Pluggable storage adapters
- ✅ **Tested** - 106 comprehensive tests

---

## API Reference

### ISettingsService

```typescript
interface ISettingsService {
  // Initialization
  init(): Promise<void>;

  // Getters (return frozen immutable objects)
  getSettings(): Settings;

  // Updates (async, validate, persist, emit events)
  updateSettings(partial: DeepPartial<Settings>): Promise<Settings>;
  resetToDefaults(): Promise<Settings>;
  loadPreset(name: string): Promise<Settings>;

  // Import/Export
  exportSettings(): string;
  importSettings(json: string): Promise<Settings>;

  // Metadata
  getAvailablePresets(): string[];
  validateSettings(settings: Partial<Settings>): ValidationResult;

  // Events
  subscribe(listener: SettingsListener): Unsubscribe;
}
```

---

## Settings Structure

All settings are in **flat format** at the root level:

```typescript
interface Settings {
  // Editor settings
  resetToSelect: boolean | 'paste';
  rotationStep: number;

  // Render settings (40+ properties)
  showValenceWarnings: boolean;
  atomColoring: boolean;
  font: string;
  fontsz: number;
  bondLength: number;
  // ... etc

  // Server settings
  'smart-layout': boolean;
  'ignore-stereochemistry-errors': boolean;
  // ... etc

  // Debug settings
  showAtomIds: boolean;
  showBondIds: boolean;
  // ... etc

  // Miew 3D viewer settings
  miewMode: string;
  miewTheme: string;
  // ... etc

  // Macromolecules settings
  selectionTool: string;
  editorLineLength: Record<string, number>;
  // ... etc
}
```

---

## Configuration

### SettingsService Options

```typescript
interface SettingsServiceOptions {
  storage?: ISettingsStorage;           // Default: LocalStorageAdapter
  validator?: ISettingsValidator;       // Default: SchemaValidator
  defaults?: DeepPartial<Settings>;     // Custom defaults
  storageKey?: string;                  // Default: 'ketcher-opts'
  autoSave?: boolean;                   // Default: true
  migrateOnLoad?: boolean;              // Default: true
}
```

### Example: Custom Configuration

```typescript
const service = new SettingsService({
  storage: new MemoryStorageAdapter(),  // Use memory instead of localStorage
  storageKey: 'my-app-settings',        // Custom key
  autoSave: false,                       // Manual save
  defaults: {
    rotationStep: 45,                    // Custom defaults
  },
});
```

---

## Storage Adapters

### LocalStorageAdapter (Default)

```typescript
import { LocalStorageAdapter } from 'ketcher-core';

const storage = new LocalStorageAdapter();
```

- Uses browser `localStorage`
- Persists across sessions
- Error handling included
- Availability check

### MemoryStorageAdapter

```typescript
import { MemoryStorageAdapter } from 'ketcher-core';

const storage = new MemoryStorageAdapter();
```

- In-memory storage
- No persistence
- Useful for testing
- Isolated instances

### Custom Storage Adapter

Implement `ISettingsStorage`:

```typescript
interface ISettingsStorage {
  load(key: string): Promise<Settings | null>;
  save(key: string, settings: Settings): Promise<void>;
  clear(key: string): Promise<void>;
  isAvailable(): boolean;
}
```

Example:

```typescript
class IndexedDBAdapter implements ISettingsStorage {
  async load(key: string): Promise<Settings | null> {
    // Implement IndexedDB load
  }

  async save(key: string, settings: Settings): Promise<void> {
    // Implement IndexedDB save
  }

  async clear(key: string): Promise<void> {
    // Implement IndexedDB clear
  }

  isAvailable(): boolean {
    return 'indexedDB' in window;
  }
}
```

---

## Validation

### Schema-Based Validation

Settings are validated using Ajv JSON Schema:

```typescript
// Automatic validation on update
await settingsService.updateSettings({
  rotationStep: 200 // Error: max is 90
});
// Throws: SettingsValidationError

// Manual validation
const result = settingsService.validateSettings({
  rotationStep: 45
});

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

### Validation Rules

- **Editor:**
  - `rotationStep`: 1-90
  - `resetToSelect`: true | false | 'paste'

- **Render:**
  - `bondThickness`: 0.1-96
  - `fontsz`: 1-96
  - `atomColoring`: boolean

- And more... (see `schema.ts`)

---

## Presets

### Available Presets

```typescript
const presets = settingsService.getAvailablePresets();
console.log(presets); // ['acs']
```

### Load Preset

```typescript
// Load ACS (American Chemical Society) style
await settingsService.loadPreset('acs');
```

### ACS Preset Features

- No atom coloring
- Specific font sizes (pt units)
- Bond thickness in points
- Chemical style formatting

### Custom Presets

Add to `schema.ts`:

```typescript
export const PRESETS: Record<string, DeepPartial<Settings>> = {
  acs: { /* ... */ },

  myPreset: {
    rotationStep: 45,
    atomColoring: true,
  },
};
```

---

## Migration

### Automatic Migration

Settings are automatically migrated from legacy storage keys and validated:

```typescript
// Current format (flat structure - all settings at root level)
{
  resetToSelect: true,
  rotationStep: 15,
  atomColoring: true,
  bondThickness: 1.2,
}

// All settings properties are at the root level (no nesting)
```

### Migration Sources

Automatically loads from:
1. `ketcher-opts` (current key)
2. `ketcher_editor_saved_settings` (legacy key)

---

## Events

### Subscribe to Changes

```typescript
const unsubscribe = settingsService.subscribe((newSettings) => {
  console.log('Settings updated:', newSettings);
  // React to changes
});

// Later: cleanup
unsubscribe();
```

### Multiple Subscribers

```typescript
const unsub1 = settingsService.subscribe(listener1);
const unsub2 = settingsService.subscribe(listener2);

// Both listeners called on update
await settingsService.updateSettings({ /* ... */ });
```

---

## Import/Export

### Export Settings

```typescript
const json = settingsService.exportSettings();
console.log(json); // JSON string

// Save to file (in browser)
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
// Trigger download...
```

### Import Settings

```typescript
// From file or clipboard
const json = '{"rotationStep":30,"atomColoring":false,...}';

await settingsService.importSettings(json);
// Validates, merges, persists, and emits event
```

---

## Error Handling

### Validation Errors

```typescript
try {
  await settingsService.updateSettings({
    rotationStep: 200 // Invalid: max is 90
  });
} catch (error) {
  if (error.name === 'SettingsValidationError') {
    console.error('Validation failed:', error.errors);
    // error.errors: Array of validation errors with paths
  }
}
```

### Storage Errors

```typescript
const service = new SettingsService({
  storage: new LocalStorageAdapter(),
  autoSave: true,
});

try {
  await service.init();
} catch (error) {
  console.error('Failed to load settings:', error);
  // Service falls back to defaults
}
```

---

## Testing

### Unit Testing

```typescript
import { SettingsService, MemoryStorageAdapter } from 'ketcher-core';

describe('My tests', () => {
  let service: SettingsService;

  beforeEach(async () => {
    const storage = new MemoryStorageAdapter();
    service = new SettingsService({ storage, autoSave: false });
    await service.init();
  });

  it('should update settings', async () => {
    await service.updateSettings({
      rotationStep: 30
    });

    const settings = service.getSettings();
    expect(settings.rotationStep).toBe(30);
  });
});
```

### Integration Testing

```typescript
it('should persist to storage', async () => {
  const storage = new MemoryStorageAdapter();
  const service = new SettingsService({ storage, autoSave: true });
  await service.init();

  await service.updateSettings({
    rotationStep: 42
  });

  // Verify storage
  const stored = await storage.load('ketcher-opts');
  expect(stored?.rotationStep).toBe(42);
});
```

---

## Performance

### Immutable Getters

All getters return frozen (immutable) objects:

```typescript
const settings = settingsService.getSettings();
settings.rotationStep = 99; // No effect (frozen)
```

### Update Batching

Batch multiple updates in one call:

```typescript
// Good: One update, one validation, one persist
await settingsService.updateSettings({
  rotationStep: 30,
  atomColoring: false,
  'smart-layout': true,
});

// Bad: Three updates, three validations, three persists
await settingsService.updateSettings({ rotationStep: 30 });
await settingsService.updateSettings({ atomColoring: false });
await settingsService.updateSettings({ 'smart-layout': true });
```

---

## Best Practices

### 1. Initialize Once

```typescript
// Good: Initialize once at app startup
const settingsService = new SettingsService(/*...*/);
await settingsService.init();

// Pass to components via props or context
<MyApp settingsService={settingsService} />
```

### 2. Use Direct Property Access

```typescript
// Good: Access properties directly from flat structure
const settings = settingsService.getSettings();
const rotationStep = settings.rotationStep;
const atomColoring = settings.atomColoring;
```

### 3. Subscribe Once per Component

```typescript
// Good: One subscription per component
useEffect(() => {
  const unsubscribe = settingsService.subscribe(handleChange);
  return unsubscribe; // Cleanup
}, [settingsService]);

// Bad: Multiple subscriptions
useEffect(() => {
  settingsService.subscribe(handleChange1);
  settingsService.subscribe(handleChange2); // Redundant
}, []);
```

### 4. Use Partial Updates

```typescript
// Good: Only update what changed
await settingsService.updateSettings({
  rotationStep: 30 // Only this changed
});

// Bad: Update everything
const allSettings = settingsService.getSettings();
allSettings.rotationStep = 30;
await settingsService.updateSettings(allSettings); // Overwrites everything
```

---

## Troubleshooting

### Settings Not Persisting

**Problem:** Settings reset on page reload

**Solution:**
- Check `autoSave` is `true` (default)
- Verify localStorage is available
- Check browser console for errors

```typescript
const service = new SettingsService({
  storage: new LocalStorageAdapter(),
  autoSave: true, // Ensure this is true
});
```

### Validation Errors

**Problem:** Updates fail with validation errors

**Solution:**
- Check value ranges in schema
- Use `validateSettings()` to test first
- Check error messages for specifics

```typescript
const result = service.validateSettings({
  rotationStep: 200 // Too high
});
console.log(result.errors); // Check what's wrong
```

### Events Not Firing

**Problem:** Subscriber not called

**Solution:**
- Ensure subscription before update
- Check unsubscribe wasn't called
- Verify service is initialized

```typescript
const unsub = service.subscribe((settings) => {
  console.log('Called!', settings);
});

// Don't call unsub() before update!
await service.updateSettings({/*...*/});
```

---

## Module Files

```
settings/
├── types.ts                 - TypeScript type definitions
├── ISettingsService.ts      - Service interface
├── SettingsService.ts       - Main implementation
├── schema.ts                - Schema, defaults, presets
├── LocalStorageAdapter.ts   - localStorage implementation
├── MemoryStorageAdapter.ts  - In-memory storage
├── SchemaValidator.ts       - Ajv validation
├── SettingsMigration.ts     - Legacy migration
├── index.ts                 - Public API exports
└── __tests__/               - Unit tests (106 tests)
```

---

## Testing

Run tests:

```bash
# From ketcher-core
npm run test:unit

# Specific test
npm run test:unit -- SettingsService.test.ts

# With coverage
npm run test:unit -- --coverage
```

Test results:
- **106 tests**
- **100% passing**
- **~12 seconds execution**

---

## Further Reading

- **SETTINGS_REFACTORING_COMPLETE.md** - Complete technical project documentation (in ketcher root)
- **EXECUTIVE_SUMMARY.md** - Business-focused project summary (in ketcher root)

---

## Support

For issues or questions:
1. Check this README
2. Check project documentation files
3. Review test files for usage examples
4. Check source code inline documentation

---

## Version

**Version:** 2.0 (Flat Format)
**Status:** Production Ready
**Tests:** 106 passing
**Coverage:** ~95%

---

**Last Updated:** 2026-03-07
