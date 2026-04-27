# Bracket Padding Fix

Changed `packages/ketcher-core/src/domain/entities/sgroup.ts` in `SGroup.bracketPos()`.

Fix:
- Removed type-based padding condition (`COP` vs non-`COP`).
- Applied one universal padding for all S-Group brackets.

```ts
const PADDING_VECTOR = new Vec2(1.2, 1.2);
```

Result: brackets render with consistent spacing and are no longer too close to monomer content.
