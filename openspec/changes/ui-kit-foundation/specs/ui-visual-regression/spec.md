## ADDED Requirements

### Requirement: Component workbench

A single Storybook instance SHALL render stories from both `ketcher-react` and `ketcher-macromolecules` sources. It SHALL provide the same tokens, global styles and providers the editors provide, including the legacy MUI and Emotion theme providers needed by stories of not-yet-migrated components.

#### Scenario: Legacy and kit stories in one place

- **WHEN** Storybook is started
- **THEN** stories of legacy components from both packages and stories of kit components SHALL be listed and render correctly

---

### Requirement: Story screenshot testing

Every story tagged `visual` SHALL get a screenshot test, generated automatically from the Storybook build's story index, with no per-story test code. Screenshots SHALL be taken in the same container image and fonts as the e2e suite, with animations disabled and the text cursor hidden, and compared at zero pixel threshold.

#### Scenario: New story gets a baseline automatically

- **WHEN** a story tagged `visual` is added
- **THEN** the story screenshot project SHALL include a test for it without any test file being edited

#### Scenario: Any pixel change fails

- **WHEN** a change alters a single pixel of a `visual` story
- **THEN** that story's screenshot test SHALL fail

#### Scenario: Interaction states are deterministic

- **WHEN** a story represents a hover, focus or open state
- **THEN** that state SHALL be produced deterministically, by props or forced pseudo-states, not by timing-dependent interaction

---

### Requirement: Characterization before migration

Before a legacy component is migrated, stories covering every state in which it is used SHALL exist for the legacy implementation, together with their baselines. The kit implementation SHALL reuse the same story identifiers, so the legacy baselines act as the parity gate.

#### Scenario: Swap under the same story

- **WHEN** a legacy component's stories are switched to render the kit component
- **THEN** the screenshots SHALL be compared against the legacy baselines under the same story identifiers

---

### Requirement: Migration PR gates

A pull request that migrates a component to the kit SHALL:

1. show zero story screenshot diff, or list and justify each diff;
2. pass the existing e2e suite without updating any baseline image;
3. list every call site that the e2e screenshots don't cover, with a confirmation that each was checked manually or a new screenshot added;
4. pass the unit tests.

#### Scenario: E2E baseline update in a migration PR

- **WHEN** a migration PR updates an existing e2e baseline image
- **THEN** the PR SHALL explain the visual difference, and the update SHALL be treated as a deviation needing explicit approval

---

### Requirement: Releasable after every merge

Every PR in this initiative SHALL leave `master` releasable, with no regression. That applies to each sub-task of a sub-project, not only to the last one. Every PR SHALL pass these gates on its own:

- the unit tests, type checks and lint;
- the existing e2e suite, in the `chromium` and `chromium-popup` projects, without updating any baseline image;
- the builds of both UI packages, of the `example` app in standalone and remote mode, and of `example-ssr`;
- once they exist, the metrics check and the story screenshot tests.

Work SHALL land on `master` in small PRs, not on a long-lived integration branch. No PR SHALL rely on a later PR to restore behaviour or pixels it broke. Wherever legacy and kit styling coexist, both SHALL work.

#### Scenario: A sub-task is merged

- **WHEN** one sub-task's PR is merged and the rest of its sub-project is not
- **THEN** `master` SHALL pass every gate listed above
- **AND** it SHALL be releasable as it stands

#### Scenario: A change that needs several steps

- **WHEN** a migration can't be split into steps that each keep the rendering intact
- **THEN** the steps SHALL be reordered, or the kit component SHALL be added alongside the legacy one and the call sites moved over PR by PR
- **AND** it SHALL NOT be merged in a broken intermediate state

#### Scenario: A host-visible change is merged

- **WHEN** a PR changes something hosts can observe, such as the declared CSS custom properties, the `theme` prop contract or where popups render
- **THEN** the same PR SHALL add the change to the release notes

#### Scenario: The initiative pauses

- **WHEN** work stops after any merged PR
- **THEN** the product SHALL render and behave as it did before the initiative began, with the guardrails still enforced

---

### Requirement: Continuous integration and progress metrics

CI SHALL build Storybook and run the story screenshot tests for pull requests that change either UI package's sources. A metrics script SHALL report the remaining counts of the following, and CI SHALL fail when any of them increases:

- `@mui/*` imports;
- `@emotion/*` imports;
- MUI class selectors;
- `!important` declarations;
- LESS files;
- Emotion-styled files.

#### Scenario: Regression in migration progress

- **WHEN** a pull request adds a new `!important` declaration or a new MUI import
- **THEN** the metrics check SHALL fail
