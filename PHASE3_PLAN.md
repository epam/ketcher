# Phase 3: Cleanup & Optimization - PLAN

## Overview

Phase 3 focuses on testing, optimization, documentation, and cleanup to ensure the settings refactoring is production-ready and maintainable.

---

## Goals

1. ✅ **Comprehensive Testing** - Unit and integration tests for React layer
2. ✅ **Performance Optimization** - Improve efficiency and reduce re-renders
3. ✅ **Documentation** - Developer guides and API documentation
4. ✅ **Deprecation Strategy** - Handle legacy SettingsManager
5. ✅ **Release Preparation** - Changelog, migration guide, release notes

---

## Task Breakdown

### 3.1 Unit Tests for React Integration ⏳

**File:** `packages/ketcher-react/src/hooks/__tests__/useSettings.test.tsx` (new)

**Test Coverage:**
- Hook initialization with/without settings service
- Settings state updates on core changes
- Redux sync dispatch on core changes
- All CRUD methods (updateSettings, resetToDefaults, loadPreset, exportSettings, importSettings)
- Category-specific settings getters
- Error handling when service unavailable
- Hook cleanup/unsubscribe

**File:** `packages/ketcher-react/src/script/ui/state/options/__tests__/sync.test.js` (new)

**Test Coverage:**
- `syncSettingsFromCore()` action creation
- Flattening namespaced settings
- Redux reducer handles `SYNC_SETTINGS_FROM_CORE`
- `convertFlatToNamespaced()` helper function
- Bidirectional conversion accuracy

**File:** `packages/ketcher-react/src/script/ui/state/options/__tests__/saveSettings.test.js` (new)

**Test Coverage:**
- Enhanced `saveSettings()` thunk
- Detection of core service availability
- Calling core `updateSettings()` when available
- Fallback to localStorage when unavailable
- Template library reinitialization
- Error handling

**Estimated:** 30-40 tests total

---

### 3.2 Integration Tests ⏳

**File:** `packages/ketcher-react/src/__tests__/settings-integration.test.tsx` (new)

**Test Scenarios:**
1. **Bidirectional Flow:**
   - Settings Dialog → Redux → Core → Hook → Redux (full circle)
   - Verify no infinite loops
   - Verify single source of truth

2. **Persistence:**
   - Change setting → Reload component → Verify persisted
   - Test localStorage read/write

3. **Preset Loading:**
   - Load ACS preset → Verify UI updates
   - Verify preset applies correctly

4. **Backward Compatibility:**
   - Components using Redux selectors get updated data
   - No breaking changes to existing components

5. **Error Recovery:**
   - Core service fails → Falls back to localStorage
   - Invalid settings → Uses defaults

**Estimated:** 10-15 integration tests

---

### 3.3 Performance Optimization ⏳

#### A. Memoization in Core

**File:** `packages/ketcher-core/src/application/settings/SettingsService.ts`

**Optimizations:**
- Cache frozen settings until change
- Add `getSettingsMemoized()` with cache invalidation
- Avoid deep cloning on every `getSettings()` call

#### B. Debounce Updates

**File:** `packages/ketcher-core/src/application/settings/SettingsService.ts`

**Optimizations:**
- Add optional `debouncePersistence` option (default 300ms)
- Batch multiple rapid updates
- Reduce localStorage writes

#### C. React Re-render Prevention

**File:** `packages/ketcher-react/src/hooks/useSettings.ts`

**Optimizations:**
- Add `useMemo` for category-specific settings
- Add shallow equality check before state update
- Prevent unnecessary re-renders

#### D. Lazy Preset Loading

**File:** `packages/ketcher-core/src/application/settings/schema.ts`

**Optimizations:**
- Move presets to separate files
- Lazy load preset definitions on demand
- Reduce initial bundle size

---

### 3.4 Old SettingsManager Deprecation ⏳

**File:** `packages/ketcher-core/src/utilities/SettingsManager.ts`

**Strategy:**
1. Add `@deprecated` JSDoc tags
2. Add console warnings when used
3. Create wrapper that delegates to SettingsService
4. Document migration path

**Migration Guide:**
```typescript
// Old (deprecated)
import { SettingsManager } from 'ketcher-core';
SettingsManager.selectionTool = 'lasso';

// New
const settingsService = ketcher.settingsService;
await settingsService.updateSettings({
  macromolecules: { selectionTool: 'lasso' }
});
```

---

### 3.5 Documentation ⏳

#### A. API Documentation

**File:** `packages/ketcher-core/docs/SETTINGS_API.md` (new)

**Contents:**
- Complete API reference for ISettingsService
- All methods with parameters and return types
- Usage examples for each method
- TypeScript types reference
- Event subscription patterns

#### B. Migration Guide

**File:** `SETTINGS_MIGRATION_GUIDE.md` (new)

**Contents:**
- Why the refactoring was done
- What changed (architecture overview)
- Step-by-step migration instructions
- Breaking changes (KetcherBuilder.build() is async)
- Code examples (before/after)
- FAQ section

#### C. Architecture Documentation

**File:** `packages/ketcher-core/docs/SETTINGS_ARCHITECTURE.md` (new)

**Contents:**
- Architecture diagrams (service, storage, validation)
- Data flow diagrams
- Class relationships (UML)
- Design patterns used
- Extension points (custom storage, validators)

#### D. Performance Guide

**File:** `packages/ketcher-core/docs/SETTINGS_PERFORMANCE.md` (new)

**Contents:**
- Optimization techniques
- Benchmarks (before/after)
- Best practices for large applications
- Debugging performance issues

---

### 3.6 Developer Experience Improvements ⏳

#### A. Better Error Messages

**Files:** SettingsService, SettingsValidator

**Improvements:**
- More descriptive validation errors
- Include field path in error messages
- Suggest corrections for common mistakes

#### B. TypeScript Enhancements

**File:** `packages/ketcher-core/src/application/settings/types.ts`

**Improvements:**
- Add JSDoc comments to all types
- Export more utility types
- Add branded types for type safety

#### C. DevTools Integration

**File:** `packages/ketcher-react/src/hooks/useSettings.ts`

**Additions:**
- Custom hook name for React DevTools
- Settings diff visualization in console (dev mode)
- Performance metrics logging (dev mode)

---

### 3.7 Changelog & Release Notes ⏳

**File:** `SETTINGS_CHANGELOG.md` (new)

**Structure:**
```markdown
## Version 3.14.0 - Settings Refactoring

### Breaking Changes
- KetcherBuilder.build() is now async (must use `await`)

### New Features
- Centralized settings service in ketcher-core
- React hook `useSettings()` for modern component access
- Settings import/export functionality
- Preset system (ACS preset included)
- Automatic migration from legacy format

### Performance Improvements
- Memoized settings getters
- Debounced localStorage writes
- Reduced re-renders with shallow equality checks

### Deprecated
- SettingsManager static class (use SettingsService instead)

### Migration
See SETTINGS_MIGRATION_GUIDE.md for detailed instructions.
```

---

### 3.8 Code Quality Improvements ⏳

#### A. Linting & Formatting

- Run ESLint on new code
- Fix any warnings
- Ensure consistent formatting

#### B. Type Safety Audit

- Review all `any` types
- Add proper type guards
- Ensure no implicit `any`

#### C. Code Coverage

- Generate coverage report
- Aim for 90%+ coverage
- Identify untested paths

---

## Priority Order

### High Priority (Must Do)
1. ✅ **Unit tests for useSettings hook** - Critical for reliability
2. ✅ **Integration tests** - Verify bidirectional flow works
3. ✅ **Performance optimizations** - Prevent production issues
4. ✅ **API Documentation** - Essential for developers
5. ✅ **Migration Guide** - Help users adopt new system

### Medium Priority (Should Do)
6. ✅ **SettingsManager deprecation** - Clean up legacy code
7. ✅ **Architecture documentation** - Help maintainers
8. ✅ **Changelog** - Document changes
9. ✅ **Better error messages** - Improve DX

### Low Priority (Nice to Have)
10. ⏳ **DevTools integration** - Advanced debugging
11. ⏳ **Lazy preset loading** - Minor optimization
12. ⏳ **Performance guide** - Additional documentation

---

## Estimated Timeline

- **Testing (3.1-3.2):** 1-2 days
- **Performance (3.3):** 1 day
- **Deprecation (3.4):** 0.5 days
- **Documentation (3.5):** 1-2 days
- **Quality (3.7-3.8):** 1 day

**Total:** 4.5-6.5 days

---

## Success Criteria

- ✅ 90%+ test coverage on new React code
- ✅ All integration tests passing
- ✅ No performance regressions
- ✅ Complete API documentation
- ✅ Migration guide with examples
- ✅ Clean deprecation warnings
- ✅ Ready for production release

---

## Next Steps

Starting with:
1. Unit tests for `useSettings()` hook
2. Unit tests for Redux sync logic
3. Integration tests for bidirectional flow

Then move to performance optimizations and documentation.
