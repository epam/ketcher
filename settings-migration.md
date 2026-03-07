# Refactor Ketcher Settings from ketcher-react to ketcher-core

## ⚠️ IMPORTANT NOTE

**This document represents an ORIGINAL PLAN that was partially changed during implementation.**

**Key Change:** The plan proposed using a namespaced settings structure (with `editor:`, `render:`, `server:` nested objects), but the final implementation uses a **flat structure** (all settings properties at the root level).

**Current Implementation:**
- Settings use **flat structure** (e.g., `{ rotationStep: 15, atomColoring: true }`)
- No nested namespaces like `editor:` or `render:`
- See `packages/ketcher-core/src/application/settings/types.ts` for actual structure
- See `packages/ketcher-core/src/application/settings/README.md` for up-to-date documentation

This document is preserved for historical reference but **does not reflect the actual implementation**.

---

## Context

**Current State:**
- Settings management is **Redux-based** in ketcher-react with 50+ settings (editor, render, server, debug, miew)
- Settings stored in `state.options.settings` with localStorage persistence via `'ketcher-opts'` key
- Schema defined in `options-schema.ts` with Ajv validation
- ketcher-core has a limited `SettingsManager` static utility class for macromolecules-specific settings
- Settings UI is feature-rich: tabs, import/export, presets (ACS), reset to defaults

**Why Refactor:**
- **Centralization**: Both micromolecules and macromolecules editors should share settings infrastructure
- **Reusability**: Settings logic should be platform-agnostic (usable in Node.js, web workers, etc.)
- **Architecture alignment**: Follows Ketcher's clean architecture (domain → application → infrastructure)
- **Maintainability**: Single source of truth reduces duplication and inconsistencies
- **Testability**: Settings logic independent of React/Redux enables better unit testing

**Goal:**
Move settings management to ketcher-core using a service-oriented, event-driven architecture that maintains backward compatibility with existing React/Redux consumers.

---

## Architectural Design

### Service-Oriented Architecture

```
┌─────────────────────────────────────┐
│         ketcher-core                │
├─────────────────────────────────────┤
│  SettingsService (injectable)       │
│  ├─ ISettingsStorage (abstraction)  │
│  │  └─ LocalStorageAdapter          │
│  ├─ ISettingsValidator              │
│  │  └─ SchemaValidator (Ajv)        │
│  └─ EventEmitter (reactive updates) │
│                                      │
│  Integrated via KetcherBuilder:     │
│  ketcher.settings.getSettings()     │
│  ketcher.settings.updateSettings()  │
└─────────────────────────────────────┘
            │ emits events
            ↓
┌─────────────────────────────────────┐
│       ketcher-react                 │
├─────────────────────────────────────┤
│  useSettings() hook                 │
│  ├─ Subscribes to core events       │
│  ├─ Syncs to Redux (backward compat)│
│  └─ Provides update functions       │
│                                      │
│  Settings Dialog uses hook          │
└─────────────────────────────────────┘
```

### Key Design Decisions

1. **Instance-based Service** (not static) - Enables dependency injection, testability, multiple instances
2. **Async API** - Future-proof for remote settings, complex validation, migration logic
3. **Event-driven updates** - Decouples core from React, supports reactive UI
4. **Strategy pattern for storage** - Abstract interface supports localStorage, memory, IndexedDB, remote
5. **Immutable settings updates** - Prevents mutations, simplifies change detection
6. **Namespace organization** - Groups related settings (editor, render, server, debug, miew, macromolecules)

---

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1-2)
**Build settings infrastructure in ketcher-core without touching React**

#### 1.1 Create Directory Structure
```
packages/ketcher-core/src/application/settings/
├── index.ts                      # Exports
├── types.ts                      # Settings, EditorSettings, RenderSettings, etc.
├── schema.ts                     # SettingsSchema with defaults & presets
├── ISettingsService.ts           # Service interface
├── SettingsService.ts            # Main implementation
├── ISettingsStorage.ts           # Storage abstraction
├── LocalStorageAdapter.ts        # localStorage implementation
├── MemoryStorageAdapter.ts       # In-memory for testing
├── ISettingsValidator.ts         # Validator interface
├── SchemaValidator.ts            # Ajv-based validation
├── SettingsMigration.ts          # Backward compatibility logic
└── __tests__/
    ├── SettingsService.test.ts
    ├── LocalStorageAdapter.test.ts
    ├── SchemaValidator.test.ts
    └── SettingsMigration.test.ts
```

#### 1.2 Define Settings Types
**File:** `packages/ketcher-core/src/application/settings/types.ts`

```typescript
export interface Settings {
  readonly editor: EditorSettings;
  readonly render: RenderSettings;
  readonly server: ServerSettings;
  readonly debug: DebugSettings;
  readonly miew: MiewSettings;
  readonly macromolecules: MacromoleculesSettings;
}

export interface EditorSettings {
  resetToSelect: boolean;
  rotationStep: number;
  showValenceWarnings: boolean;
  atomColoring: boolean;
  // ... ~10 more settings
}

export interface RenderSettings {
  // Atoms, bonds, fonts, colors, stereochemistry
  // ... ~30 settings from current options-schema.ts
}

export interface ServerSettings {
  'smart-layout': boolean;
  'ignore-stereochemistry-errors': boolean;
  'dearomatize-on-load': boolean;
  // ... ~6 more server settings
}

export interface DebugSettings {
  showAtomIds: boolean;
  showBondIds: boolean;
  showHalfBondIds: boolean;
  showLoopIds: boolean;
}

export interface MiewSettings {
  enabled: boolean;
  mode: string;
  theme: string;
}

export interface MacromoleculesSettings {
  selectionTool: string;
  editorLineLength: number;
  disableCustomQuery: boolean;
  monomerLibraryUpdates: boolean;
  ignoreChiralFlag: boolean;
}
```

#### 1.3 Implement ISettingsService Interface
**File:** `packages/ketcher-core/src/application/settings/ISettingsService.ts`

```typescript
export interface ISettingsService {
  init(): Promise<void>;
  getSettings(): Settings;
  getEditorSettings(): EditorSettings;
  getRenderSettings(): RenderSettings;
  getServerSettings(): ServerSettings;
  getDebugSettings(): DebugSettings;
  getMiewSettings(): MiewSettings;
  getMacromoleculesSettings(): MacromoleculesSettings;
  updateSettings(partial: DeepPartial<Settings>): Promise<Settings>;
  resetToDefaults(): Promise<Settings>;
  loadPreset(name: string): Promise<Settings>;
  getAvailablePresets(): string[];
  validateSettings(settings: Partial<Settings>): ValidationResult;
  exportSettings(): string;
  importSettings(json: string): Promise<Settings>;
  subscribe(listener: SettingsListener): Unsubscribe;
  getSchema(): SettingsSchema;
}
```

#### 1.4 Implement SettingsService
**File:** `packages/ketcher-core/src/application/settings/SettingsService.ts`

**Key Implementation Details:**
- Constructor accepts `SettingsServiceOptions` (storage, validator, defaults, storageKey, autoSave)
- `init()` method: loads from storage, runs migration, validates, persists
- `updateSettings()`: validates → deep merges → persists → emits event
- Uses EventEmitter for reactive updates
- All getters return frozen objects (immutability)
- Error handling with fallback to defaults

#### 1.5 Migrate Schema from React
**File:** `packages/ketcher-core/src/application/settings/schema.ts`

**Tasks:**
1. Copy schema from `packages/ketcher-react/src/script/ui/data/schema/options-schema.ts`
2. Organize into namespace with category defaults:
   - `EDITOR_DEFAULTS`
   - `RENDER_DEFAULTS`
   - `SERVER_DEFAULTS`
   - `DEBUG_DEFAULTS`
   - `MIEW_DEFAULTS`
   - `MACROMOLECULES_DEFAULTS`
3. Include `SCHEMA` (JSON Schema for Ajv)
4. Include `PRESETS` object with ACS preset from `constants.ts`

#### 1.6 Implement Storage Adapters
**Files:**
- `LocalStorageAdapter.ts` - Wraps localStorage with error handling, availability check
- `MemoryStorageAdapter.ts` - In-memory Map for testing

**Interface:**
```typescript
export interface ISettingsStorage {
  load(key: string): Promise<Settings | null>;
  save(key: string, settings: Settings): Promise<void>;
  clear(key: string): Promise<void>;
  isAvailable(): boolean;
}
```

#### 1.7 Implement Validator
**File:** `packages/ketcher-core/src/application/settings/SchemaValidator.ts`

**Implementation:**
- Uses Ajv library (already in ketcher-react dependencies)
- Validates full settings and partial updates
- Returns `ValidationResult` with errors array
- Filters out invalid properties (graceful degradation)

#### 1.8 Implement Migration Logic
**File:** `packages/ketcher-core/src/application/settings/SettingsMigration.ts`

**Handles:**
1. Detect old flat format vs. new namespaced format
2. Migrate flat Redux settings to namespaced structure
3. Load from legacy keys: `'ketcher-opts'` and `'ketcher_editor_saved_settings'`
4. Merge settings from multiple sources
5. Handle missing or corrupted data gracefully

#### 1.9 Integrate with Ketcher Class
**File:** `packages/ketcher-core/src/application/ketcher.ts`

**Changes:**
```typescript
export class Ketcher {
  readonly settings: ISettingsService; // ← NEW

  constructor(options: {
    editor: Editor;
    formatterFactory: FormatterFactory;
    structService: Indigo;
    settings: ISettingsService; // ← NEW
  }) {
    // ... existing code
    this.settings = options.settings;

    // Subscribe to settings changes
    this.settings.subscribe((newSettings) => {
      this.onSettingsChanged(newSettings);
    });
  }

  private onSettingsChanged(settings: Settings): void {
    // Update editor options
    this.editor?.updateOptions(settings.editor);
    // Trigger re-render with new settings
    this.editor?.render(settings.render);
  }

  // Convenience methods
  getSettings(): Settings {
    return this.settings.getSettings();
  }

  async updateSettings(partial: DeepPartial<Settings>): Promise<Settings> {
    return this.settings.updateSettings(partial);
  }
}
```

#### 1.10 Integrate with KetcherBuilder
**File:** `packages/ketcher-core/src/application/ketcherBuilder.ts`

**Changes:**
```typescript
export class KetcherBuilder {
  private settingsService?: ISettingsService;
  private storageAdapter?: ISettingsStorage;
  private initialSettings?: Partial<Settings>;

  withSettingsService(service: ISettingsService): this {
    this.settingsService = service;
    return this;
  }

  withStorageAdapter(adapter: ISettingsStorage): this {
    this.storageAdapter = adapter;
    return this;
  }

  withSettings(settings: Partial<Settings>): this {
    this.initialSettings = settings;
    return this;
  }

  async build(): Promise<Ketcher> {
    // Initialize settings service if not provided
    if (!this.settingsService) {
      this.settingsService = new SettingsService({
        storage: this.storageAdapter,
        defaults: this.initialSettings,
        autoSave: true,
        migrateOnLoad: true,
      });
    }

    await this.settingsService.init();

    // ... existing build logic

    const ketcher = new Ketcher({
      editor: this.editor,
      formatterFactory: this.formatterFactory,
      structService: this.structService,
      settings: this.settingsService, // ← NEW
    });

    return ketcher;
  }
}
```

#### 1.11 Export Public API
**File:** `packages/ketcher-core/src/index.ts`

```typescript
// Add exports
export * from './application/settings';
```

#### 1.12 Write Comprehensive Tests
**Files in `__tests__/`:**

Test coverage for:
- Initialization (defaults, load from storage, migration)
- Update settings (validation, deep merge, persistence, events)
- Presets (load, list available)
- Import/Export (JSON serialization)
- Subscription management (multiple listeners, unsubscribe)
- Storage adapters (localStorage, memory)
- Validator (schema validation, partial validation)
- Migration (flat to namespaced, legacy keys)

**Target: 90%+ code coverage**

---

### Phase 2: React Integration (Week 3-4)
**Connect React to core settings with backward compatibility**

#### 2.1 Create useSettings Hook
**File:** `packages/ketcher-react/src/hooks/useSettings.ts`

```typescript
export function useSettings() {
  const dispatch = useAppDispatch();
  const ketcherInstance = useAppSelector(state => state.editor.ketcherInstance);
  const settingsService = ketcherInstance?.settings;

  const [settings, setSettings] = useState<Settings | null>(
    settingsService?.getSettings() || null
  );

  useEffect(() => {
    if (!settingsService) return;

    // Subscribe to core settings changes
    const unsubscribe = settingsService.subscribe((newSettings) => {
      // 1. Update local state
      setSettings(newSettings);

      // 2. Sync to Redux for backward compatibility
      dispatch(updateReduxSettings(newSettings));
    });

    // Initialize with current settings
    const current = settingsService.getSettings();
    setSettings(current);
    dispatch(updateReduxSettings(current));

    return unsubscribe;
  }, [settingsService, dispatch]);

  const updateSettings = async (partial: DeepPartial<Settings>) => {
    if (!settingsService) throw new Error('Settings service not available');
    return settingsService.updateSettings(partial);
  };

  const resetToDefaults = async () => {
    if (!settingsService) throw new Error('Settings service not available');
    return settingsService.resetToDefaults();
  };

  const loadPreset = async (name: string) => {
    if (!settingsService) throw new Error('Settings service not available');
    return settingsService.loadPreset(name);
  };

  const exportSettings = () => {
    if (!settingsService) throw new Error('Settings service not available');
    return settingsService.exportSettings();
  };

  const importSettings = async (json: string) => {
    if (!settingsService) throw new Error('Settings service not available');
    return settingsService.importSettings(json);
  };

  return {
    settings,
    updateSettings,
    resetToDefaults,
    loadPreset,
    exportSettings,
    importSettings,
    availablePresets: settingsService?.getAvailablePresets() || [],
  };
}
```

#### 2.2 Update Redux Store
**File:** `packages/ketcher-react/src/script/ui/state/options/index.js`

**Changes:**
- Keep existing Redux slice for backward compatibility
- Add action to sync settings from core: `updateReduxSettings(settings)`
- Redux becomes a passive consumer, not source of truth
- Existing selectors continue to work

#### 2.3 Update KetcherBuilder in React
**File:** `packages/ketcher-react/src/script/builders/ketcher/KetcherBuilder.ts`

**Ensure settings service is initialized:**
```typescript
async appendApiAsync(structServiceProvider: StructServiceProvider) {
  // ... existing code

  // Initialize ketcher with settings
  const ketcherBuilder = new CoreKetcherBuilder()
    .withStructServiceProvider(structServiceProvider)
    .withSettings(this.options.settings); // Pass initial settings from props

  const ketcher = await ketcherBuilder.build();
  return ketcher;
}
```

#### 2.4 Update Settings Dialog
**File:** `packages/ketcher-react/src/script/ui/views/modal/components/meta/Settings/Settings.tsx`

**Changes:**
1. Replace Redux `connect()` with `useSettings()` hook
2. Call `updateSettings()` from hook instead of dispatching Redux actions
3. Keep UI structure identical (tabs, buttons, form fields)
4. Use settings categories from hook: `settings.editor`, `settings.render`, etc.

**Example:**
```typescript
export function SettingsDialog() {
  const {
    settings,
    updateSettings,
    resetToDefaults,
    loadPreset,
    exportSettings,
    importSettings,
    availablePresets,
  } = useSettings();

  const handleEditorSettingChange = async (key: string, value: any) => {
    await updateSettings({ editor: { [key]: value } });
  };

  const handleReset = async () => {
    await resetToDefaults();
  };

  // ... render tabs with settings categories
}
```

#### 2.5 Update Components Reading Settings
**Files to check:**
- `packages/ketcher-react/src/script/ui/views/Editor.jsx` - Pass settings from core
- `packages/ketcher-react/src/script/ui/views/modal/components/process/Miew/Miew.tsx` - Read Miew settings
- `packages/ketcher-react/src/script/ui/views/modal/components/document/Save/Save.tsx` - Read render settings
- Any other components accessing `state.options.settings`

**Strategy:**
- Replace `useSelector(state => state.options.settings)` with `useSettings()` hook
- Or keep Redux selectors working through sync (backward compatible)

#### 2.6 Handle Server Settings Transformation
**Decision:** Keep transformation in React initially for lower risk

**File:** `packages/ketcher-react/src/script/services/serverSettingsTransformer.ts` (new)

```typescript
export function transformServerSettings(settings: ServerSettings): Record<string, any> {
  // Transform for server API (e.g., boolean to string)
  return Object.entries(settings).reduce((acc, [key, value]) => {
    acc[key] = typeof value === 'boolean' ? String(value) : value;
    return acc;
  }, {} as Record<string, any>);
}
```

**Usage in struct service calls:**
```typescript
const serverParams = transformServerSettings(ketcher.settings.getServerSettings());
await ketcher.structService.convert(molecule, format, serverParams);
```

#### 2.7 Integration Tests
**File:** `packages/ketcher-react/src/script/__tests__/settings-integration.test.tsx`

**Test:**
- Settings sync from core to Redux
- React components re-render on settings changes
- Settings dialog updates core settings
- Settings persist across page reloads
- Backward compatibility with existing localStorage data
- Server settings transformation

---

### Phase 3: Cleanup & Optimization (Week 5-6)
**Remove technical debt and optimize**

#### 3.1 Deprecate Old SettingsManager
**File:** `packages/ketcher-core/src/utilities/SettingsManager.ts`

**Options:**
1. **Wrapper approach:** Make SettingsManager delegate to SettingsService (backward compatible)
2. **Deprecation warnings:** Add `@deprecated` JSDoc tags and console warnings
3. **Migration guide:** Document how to migrate from SettingsManager to SettingsService

#### 3.2 Optimize Performance
**Optimizations:**
- Add memoization to `getSettings()` (cache until changes)
- Debounce rapid updates to reduce localStorage writes
- Use shallow equality checks in React to prevent unnecessary re-renders
- Lazy load presets on-demand

#### 3.3 Move Server Settings Transformation (Optional)
**Consideration:** Move transformation logic to ketcher-core if beneficial

**Trade-off:**
- **Pros:** Centralized, reusable, testable in isolation
- **Cons:** Requires analyzing all server interaction points, higher risk

**Decision:** Evaluate based on Phase 2 results

#### 3.4 Documentation
**Create:**
- API documentation for `ISettingsService` with examples
- Migration guide for external consumers
- Architecture documentation with diagrams
- Performance considerations
- Extension guide (custom storage, validation)

#### 3.5 Changelog & Release Notes
**Document:**
- Breaking changes (if any)
- Migration path from Redux to core
- New features (import/export, presets)
- Performance improvements
- Deprecation warnings

---

## Critical Files

### Core Package (ketcher-core)
1. **`packages/ketcher-core/src/application/settings/SettingsService.ts`** - Main service with all business logic
2. **`packages/ketcher-core/src/application/settings/schema.ts`** - Schema migrated from options-schema.ts with defaults and presets
3. **`packages/ketcher-core/src/application/settings/SettingsMigration.ts`** - Backward compatibility for localStorage migration
4. **`packages/ketcher-core/src/application/ketcherBuilder.ts`** - Integration point for settings service injection
5. **`packages/ketcher-core/src/application/ketcher.ts`** - Exposes settings via `ketcher.settings` property

### React Package (ketcher-react)
6. **`packages/ketcher-react/src/hooks/useSettings.ts`** - React hook subscribing to core and syncing Redux
7. **`packages/ketcher-react/src/script/ui/views/modal/components/meta/Settings/Settings.tsx`** - Settings dialog using hook
8. **`packages/ketcher-react/src/script/ui/state/options/index.js`** - Redux adapter (passive consumer)

---

## Backward Compatibility

### Guarantees
1. **localStorage keys**: Support both `'ketcher-opts'` and `'ketcher_editor_saved_settings'` during migration
2. **Redux state**: Maintain `state.options.settings` structure, synced from core
3. **Public API**: Keep existing methods on Ketcher class, delegate to SettingsService
4. **Schema format**: Automatically migrate flat to namespaced format
5. **React components**: No prop/hook interface changes required (internal migration)

### Migration Strategy
- **Phase 1**: Core infrastructure, no React changes → **Zero risk**
- **Phase 2**: React integration with sync → **Low risk** (backward compatible)
- **Phase 3**: Cleanup and optimize → **Acceptable risk** with deprecation warnings

---

## Testing Strategy

### Unit Tests (ketcher-core)
- **SettingsService**: Initialization, updates, validation, events, presets, import/export, subscriptions
- **LocalStorageAdapter**: Load, save, clear, availability check, error handling
- **SchemaValidator**: Schema validation, partial validation, error reporting
- **SettingsMigration**: Flat to namespaced, legacy key loading, graceful degradation

**Target: 90%+ code coverage**

### Integration Tests (ketcher-react)
- Settings sync from core to Redux
- React re-renders on settings changes
- Settings dialog updates core
- Backward compatibility with existing data
- Server settings transformation

### E2E Tests
- Save settings to localStorage
- Persist settings across page reloads
- Apply ACS preset
- Import/export settings
- Settings affect rendering

---

## Verification Steps

### After Phase 1
1. Run `npm run build:core` - Verify clean build
2. Run `npm run test -- packages/ketcher-core/src/application/settings` - All tests pass
3. Run `npm run test:types` - No TypeScript errors
4. Import SettingsService in Node.js script - Verify API works

### After Phase 2
1. Run `npm run build` - Verify clean build (all packages)
2. Run `npm run serve:standalone` - App launches without errors
3. Open Settings dialog - Verify all tabs and controls work
4. Change a setting - Verify persistence to localStorage
5. Reload page - Verify settings persist
6. Apply ACS preset - Verify visual changes
7. Export settings - Verify JSON format
8. Import settings - Verify settings applied
9. Check Redux DevTools - Verify `state.options.settings` synced from core
10. Run integration tests - All pass

### After Phase 3
1. Run all tests - All pass
2. Build documentation - No errors
3. Check for deprecation warnings in console
4. Verify migration guide accuracy
5. Performance benchmark - No regressions

---

## Timeline Estimate

- **Phase 1**: 1-2 weeks (Core infrastructure + tests)
- **Phase 2**: 1-2 weeks (React integration + tests)
- **Phase 3**: 1-2 weeks (Cleanup + documentation)

**Total**: 3-6 weeks depending on team size and priorities

---

## Success Criteria

- ✅ All settings logic in ketcher-core, testable without React
- ✅ Both micromolecules and macromolecules editors use same settings service
- ✅ 90%+ test coverage in ketcher-core settings module
- ✅ Zero breaking changes for React consumers (Phase 1-2)
- ✅ Settings persist correctly across page reloads
- ✅ All existing features work (presets, import/export, validation)
- ✅ Performance neutral or improved vs. current implementation
- ✅ Comprehensive documentation and migration guide
