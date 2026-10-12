## ADDED Requirements

### Requirement: Settings window is reachable from the top toolbar in both modes
The system SHALL provide a Settings icon in the top toolbar of both molecules and macromolecules mode. In macromolecules mode the icon SHALL sit immediately to the left of the About icon and SHALL be separated from the Micro/Macro mode switcher by a vertical divider.

#### Scenario: Settings icon opens the window in molecules mode
- **WHEN** the user clicks the Settings icon in the molecules-mode top toolbar
- **THEN** the Settings window opens

#### Scenario: Settings icon opens the window in macromolecules mode
- **WHEN** the user clicks the Settings icon in the macromolecules-mode top toolbar
- **THEN** the Settings window opens with the same layout, groups and field order as in molecules mode

#### Scenario: Settings icon placement in macromolecules mode
- **WHEN** the user looks at the macromolecules-mode top toolbar
- **THEN** the Settings icon appears directly to the left of the About icon, and a vertical divider separates the Settings/About/Help group from the Micro/Macro switcher

### Requirement: Settings window opens as a floating panel at the right of the canvas
The Settings window SHALL open as a fixed-width floating panel anchored to the right side of the canvas area in both modes. It SHALL NOT overlap the top toolbar, the left toolbar, the bottom toolbar, the right toolbar (molecules mode) or the monomer library (macromolecules mode) at its default position.

#### Scenario: Default position in molecules mode
- **WHEN** the user opens the Settings window in molecules mode
- **THEN** the panel is positioned inside the canvas area with its right edge next to the right toolbar and its top edge below the top toolbar

#### Scenario: Default position in macromolecules mode
- **WHEN** the user opens the Settings window in macromolecules mode with the monomer library visible
- **THEN** the panel is positioned inside the canvas area with its right edge next to the monomer library and its top edge below the top toolbar

#### Scenario: Panel content scrolls, header and footer stay visible
- **WHEN** the expanded groups make the content taller than the available canvas height
- **THEN** the panel height is capped to the canvas area, the group content scrolls vertically, and the title row and the Cancel/Apply footer remain visible

#### Scenario: Window reopens at the default position
- **WHEN** the user drags the window, closes it, and opens it again
- **THEN** the window appears at its default anchored position

### Requirement: Settings window does not grey out the canvas
The system SHALL keep the canvas and its contents rendered at full opacity while the Settings window is open. No dimming overlay SHALL be drawn over the canvas or the toolbars.

#### Scenario: Canvas stays fully visible
- **WHEN** the user opens the Settings window with a structure on the canvas
- **THEN** the structure is rendered at normal opacity with no dimming layer over the canvas or the toolbars

### Requirement: Canvas is not modifiable while the Settings window is open
The system SHALL prevent all canvas modification while the Settings window is open. Clicks, drags and keyboard input directed at the canvas SHALL NOT create, delete, move, select or otherwise alter any structure.

#### Scenario: Clicking the canvas does not add an atom
- **WHEN** the Settings window is open and the user clicks on an empty area of the canvas
- **THEN** no atom is added and the structure is unchanged

#### Scenario: Dragging an existing atom does nothing
- **WHEN** the Settings window is open and the user drags an existing atom
- **THEN** the atom does not move and the structure is unchanged

#### Scenario: Canvas is modifiable again after closing
- **WHEN** the user closes the Settings window and then clicks the canvas with a drawing tool active
- **THEN** the canvas responds normally

### Requirement: All toolbar buttons are disabled while the Settings window is open
The system SHALL render every toolbar button in both modes in its disabled state while the Settings window is open, and SHALL ignore activation of those buttons.

#### Scenario: Molecules-mode toolbars are disabled
- **WHEN** the Settings window is open in molecules mode
- **THEN** the buttons of the top, left, bottom and right toolbars are shown as disabled and clicking them performs no action

#### Scenario: Macromolecules-mode toolbars and library are disabled
- **WHEN** the Settings window is open in macromolecules mode
- **THEN** the top toolbar buttons, the left menu buttons and the monomer library are shown as disabled and clicking them performs no action

#### Scenario: Toolbars re-enable after closing
- **WHEN** the user closes the Settings window
- **THEN** every toolbar button returns to the enabled/disabled state it would have had without the window

### Requirement: Settings window can be dragged but stays inside the canvas area
The user SHALL be able to move the Settings window by dragging its title row. The system SHALL clamp the window so that its entire rectangle always remains inside the canvas area, i.e. it can never be moved over the toolbars, over the monomer library, or outside the viewport.

#### Scenario: Window follows the pointer when dragged by the header
- **WHEN** the user presses on the window title row and moves the pointer within the canvas area
- **THEN** the window moves with the pointer

#### Scenario: Drag towards the top toolbar is clamped
- **WHEN** the user drags the window upwards past the top edge of the canvas area
- **THEN** the window stops with its top edge at the top of the canvas area and does not overlap the top toolbar

#### Scenario: Drag towards the left toolbar is clamped
- **WHEN** the user drags the window to the left past the left edge of the canvas area
- **THEN** the window stops with its left edge at the left of the canvas area and does not overlap the left toolbar

#### Scenario: Drag towards the monomer library is clamped
- **WHEN** in macromolecules mode the user drags the window to the right past the right edge of the canvas area
- **THEN** the window stops with its right edge at the right of the canvas area and does not overlap the monomer library

#### Scenario: Window is pulled back inside after the container shrinks
- **WHEN** the window has been dragged near an edge and the application container is then made smaller
- **THEN** the window is repositioned so that its whole rectangle is inside the new canvas area

#### Scenario: Dragging the window does not change the canvas
- **WHEN** the user drags the window across the canvas
- **THEN** no structure on the canvas is selected, moved or altered

### Requirement: Settings are presented as a collapsible group accordion
The Settings window SHALL present all settings in named collapsible groups in the order: Atoms, Bonds, Stereochemistry, Reactions & Components, General Editing & Display, Validation & Calculation, Debugging. The Atoms group SHALL be expanded when the window opens; all others SHALL be collapsed. More than one group MAY be expanded at a time.

#### Scenario: Group order and initial state
- **WHEN** the user opens the Settings window
- **THEN** the seven groups are listed in the specified order with Atoms expanded and all other groups collapsed

#### Scenario: Expanding a second group keeps the first expanded
- **WHEN** the user expands the Bonds group while Atoms is expanded
- **THEN** both Atoms and Bonds are expanded

#### Scenario: Collapsing a group hides its fields
- **WHEN** the user clicks the header of an expanded group
- **THEN** the group's fields are hidden and only its header row remains

#### Scenario: Collapsed group headers stack below the expanded content
- **WHEN** one group is expanded and the rest are collapsed
- **THEN** the collapsed group headers remain visible as a stack of rows below the expanded group's content

### Requirement: 3D Viewer settings belong to General Editing & Display
The system SHALL NOT present a separate 3D Viewer group. The 3D Viewer Display Mode, Background Color and Label Coloring settings SHALL appear at the end of the General Editing & Display group.

#### Scenario: No 3D Viewer group exists
- **WHEN** the user opens the Settings window
- **THEN** no group titled 3D Viewer is present

#### Scenario: 3D Viewer fields appear under General Editing & Display
- **WHEN** the user expands General Editing & Display
- **THEN** the last three fields are 3D Viewer: Display Mode, 3D Viewer: Background Color and 3D Viewer: Label Coloring

### Requirement: Field descriptions are shown inline beneath their control
The system SHALL render each setting's description as static text directly beneath that setting's control. Descriptions SHALL NOT require hovering an icon to be read, and no per-field information icon SHALL be rendered.

#### Scenario: A described setting shows its description inline
- **WHEN** the user expands a group containing a setting that has a description
- **THEN** the description is visible beneath that setting's control without any hover interaction

#### Scenario: No information icons in the window
- **WHEN** the user opens the Settings window
- **THEN** no field shows an information/tooltip icon next to its label

### Requirement: Settings changes are applied or discarded as one batch
The system SHALL stage all edits made in the Settings window locally and SHALL write them only when the user activates Apply. Cancel and the close button SHALL discard every staged edit. Apply and Cancel SHALL close the window.

#### Scenario: Apply persists the staged edits
- **WHEN** the user changes one or more settings and clicks Apply
- **THEN** the window closes, the canvas re-renders with the new settings, and the settings persist across a page reload

#### Scenario: Cancel discards the staged edits
- **WHEN** the user changes one or more settings and clicks Cancel
- **THEN** the window closes and every setting keeps the value it had before the window was opened

#### Scenario: Close button discards the staged edits
- **WHEN** the user changes one or more settings and clicks the close button in the window header
- **THEN** the window closes and every setting keeps the value it had before the window was opened

#### Scenario: Settings applied in one mode are visible in the other
- **WHEN** the user applies a setting change in macromolecules mode and then switches to molecules mode and opens the Settings window
- **THEN** the changed setting shows the applied value

### Requirement: Settings window footer offers only Cancel and Apply
The Settings window footer SHALL contain exactly two actions: Cancel and Apply. The Open from File, Save to File, Reset and Set ACS Settings actions SHALL remain available from the window header row.

#### Scenario: Footer contents
- **WHEN** the user opens the Settings window
- **THEN** the footer contains a Cancel action and an Apply action and no other action

#### Scenario: File and reset actions remain reachable
- **WHEN** the user opens the Settings window
- **THEN** the header row offers Open from File, Save to File, Reset and Set ACS Settings

### Requirement: Fields removed from the window remain settable through the API
The system SHALL continue to accept and persist the Language, Valence Mode, Aromatize-skip-superatoms and Dearomatize-on-load options through the public settings API even though they are no longer rendered in the Settings window.

#### Scenario: Removed options are absent from the window
- **WHEN** the user opens the Settings window and expands every group
- **THEN** no control for Language, Valence Mode, Aromatize-skip-superatoms or Dearomatize-on-load is present

#### Scenario: Removed options still round-trip through the API
- **WHEN** a host application sets one of those options through the public settings API and then reads the settings back
- **THEN** the option holds the value that was set, and it takes effect in the editor
