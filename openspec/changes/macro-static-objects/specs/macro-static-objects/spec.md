## ADDED Requirements

### Requirement: Static objects are visible in Macromolecules mode

The system SHALL show shapes, text boxes and images in Macromolecules mode, in every layout, at the positions they have in Molecules mode.

#### Scenario: Switching to Macromolecules mode with static objects

- **WHEN** the canvas in Molecules mode holds an ellipse, a rectangle, a line, a text box and an image
- **AND** the user switches to Macromolecules mode in flex layout
- **THEN** all five objects are drawn on the Macromolecules canvas

#### Scenario: Sequence layout keeps static objects in place

- **WHEN** the user switches the Macromolecules layout to sequence
- **THEN** static objects are still drawn at the same positions

### Requirement: Static objects survive switching modes

The system SHALL keep every static object and its position when the user switches between Molecules and Macromolecules modes in either direction, and SHALL NOT duplicate it.

#### Scenario: Object created in Macromolecules mode appears in Molecules mode

- **WHEN** the user draws a rectangle in Macromolecules mode
- **AND** switches to Molecules mode
- **THEN** the rectangle is on the Molecules canvas at the same coordinates

#### Scenario: Round trip does not duplicate objects

- **WHEN** the user switches from Molecules to Macromolecules mode and back
- **THEN** the canvas holds the same number of static objects as before

### Requirement: Static objects are editable in Macromolecules mode

The system SHALL let the user select, move, resize by handle and delete static objects in Macromolecules mode, and SHALL make each change undoable as one step.

#### Scenario: Resize a rectangle by its corner handle

- **WHEN** the user selects a rectangle and drags its bottom-right handle
- **THEN** the rectangle's bottom-right corner follows the pointer
- **AND** one undo restores the previous size

#### Scenario: Edit a text box

- **WHEN** the user double-clicks a text box with a selection tool
- **THEN** the text editor opens with the current content
- **AND** applying empty content deletes the text box

### Requirement: Static objects can be added in Macromolecules mode

The system SHALL provide, in the Macromolecules left toolbar, a section with a shapes submenu (ellipse, rectangle, line), a text tool and an image tool that add objects as in Molecules mode and then return to the saved selection tool.

#### Scenario: Draw an ellipse

- **WHEN** the user picks the ellipse tool and drags on the canvas
- **THEN** an ellipse inscribed in the dragged box is added
- **AND** a click without dragging adds nothing

#### Scenario: Add an image

- **WHEN** the user picks the image tool, clicks the canvas and chooses a PNG of at least 16×16 pixels
- **THEN** the image is added, centred on the click point

#### Scenario: Static-object tools are disabled in sequence layout

- **WHEN** the Macromolecules layout is sequence
- **THEN** the shapes, text and image toolbar buttons are disabled

### Requirement: Static objects are not affected by layout

The system SHALL NOT move or resize static objects when the user switches between Macromolecules layouts.

#### Scenario: Switching from flex to snake layout

- **WHEN** the canvas holds a rectangle and monomers in flex layout
- **AND** the user switches to snake layout
- **THEN** the rectangle keeps its coordinates
