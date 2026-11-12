## ADDED Requirements

### Requirement: Explicit supported-browser floor

The repository SHALL declare one browser floor for the published UI packages' CSS: Chrome ≥ 111, Edge ≥ 111, Firefox ≥ 114 and Safari ≥ 16.4. This floor matches issue #11997. It SHALL be defined once in the shared PostCSS configuration and passed explicitly to CSS tooling. JavaScript transpilation targets SHALL NOT change in this change; they remain with #11997/#11974.

#### Scenario: CSS tooling uses the declared floor

- **WHEN** `ketcher-react` or `ketcher-macromolecules` is built
- **THEN** autoprefixer SHALL use the declared floor, not its defaults

#### Scenario: Published JS syntax level is unchanged

- **WHEN** `ketcher-react` and `ketcher-macromolecules` are built after this change
- **THEN** the emitted JavaScript SHALL use the same syntax level as before this change, so host bundlers that could parse it before can still parse it

#### Scenario: Supported browsers are documented

- **WHEN** an integrator reads the repository README
- **THEN** it SHALL list the supported browsers and minimum versions, and reference the floor's rationale

---

### Requirement: Modern CSS compiled for the floor

Stylesheets SHALL be able to use native CSS nesting, `color-mix()`, `:where()` and CSS custom properties. Native nesting SHALL be flattened at build time by a shared PostCSS configuration, because not every browser on the floor supports it. Features that every browser on the floor supports SHALL be emitted unchanged.

#### Scenario: Nesting is flattened in the published CSS

- **WHEN** a `.module.css` file using native nesting is built into `dist/index.css`
- **THEN** the emitted CSS SHALL contain no nested rules

#### Scenario: color-mix is emitted natively

- **WHEN** a stylesheet uses `color-mix()` with a `var(--ketcher-*)` argument
- **THEN** the emitted CSS SHALL keep `color-mix()` as written, so the value is still resolved at runtime

#### Scenario: Rollup and Vite agree

- **WHEN** the same stylesheet is built by the package's rollup build and served by the `example` Vite dev server
- **THEN** both SHALL apply the same PostCSS configuration
