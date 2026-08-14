## ADDED Requirements

### Requirement: Warning on wizard entry when APs are in use

When the Monomer Creation Wizard is opened to edit a monomer that has one or more attachment points currently occupied by bonds on the canvas, the wizard SHALL display a dismissible info notification listing all in-use AP names and informing the user that deleting those APs will delete the corresponding bonds.

The in-use AP set is determined by `attachmentAtomIdsWithExternalBonds` stored in `MonomerCreationState` — populated at wizard-open time from both `editInstanceAttachmentPoints` (SGroup APs bound to existing canvas bonds) and from the partial-selection external bond path.

#### Scenario: Single in-use AP

- **WHEN** a monomer with one bond on AP R1 is opened in the wizard
- **THEN** an info notification is shown: "Deleting attachment point R1 will result in deleting of bonds that use those attachment points after saving."

#### Scenario: Multiple in-use APs

- **WHEN** a monomer with bonds on APs R1 and R2 is opened in the wizard
- **THEN** an info notification is shown: "Deleting attachment point R1 and R2 will result in deleting of bonds that use those attachment points after saving."

#### Scenario: No in-use APs

- **WHEN** a monomer with no bonds on any AP is opened in the wizard
- **THEN** no used-AP warning notification is shown

#### Scenario: Notification is dismissible

- **WHEN** the used-AP warning notification is visible
- **AND** the user clicks the "OK" button on the notification
- **THEN** the notification is removed from the wizard

### Requirement: Bond deleted when its AP is removed in the wizard

When the user saves a monomer edit and the new template does not contain an AP that previously had an active bond, that bond SHALL be removed from the canvas.

#### Scenario: PolymerBond deleted when AP removed

- **WHEN** a monomer with a PolymerBond on AP R2 is edited in the wizard
- **AND** the user removes the AP R2 from the structure
- **AND** the user saves
- **THEN** the PolymerBond that was using AP R2 is deleted from the canvas

#### Scenario: MonomerToAtomBond deleted when AP removed

- **WHEN** a monomer with a MonomerToAtomBond on AP R3 is edited in the wizard
- **AND** the user removes the AP R3 from the structure
- **AND** the user saves
- **THEN** the MonomerToAtomBond that was using AP R3 is deleted from the canvas

#### Scenario: Bonds for non-removed APs are preserved

- **WHEN** a monomer with bonds on R1 and R2 is edited in the wizard
- **AND** the user removes only AP R2
- **AND** the user saves
- **THEN** the bond on AP R1 remains intact on the canvas
- **THEN** only the bond on AP R2 is deleted

### Requirement: Bond reconnected when its AP is moved to a different atom

When the user saves a monomer edit and an AP that previously had an active bond is now assigned to a different atom in the structure, that bond SHALL remain on the canvas but its endpoint atom SHALL be updated to the new atom.

**Implementation note:** Endpoint update for moved APs is applied at the `Struct` level by `updateBondEndpointByAttachmentPoint` (which looks up the SGroup's attachment point by `attachmentPointNumber`). No macro-canvas `PolymerBond` operation is needed — the bond object continues to reference the same monomer under the same AP name.

#### Scenario: PolymerBond endpoint atom updated when AP moved

- **WHEN** a monomer with a PolymerBond on AP R1 is edited in the wizard
- **AND** the user reassigns AP R1 to a different atom
- **AND** the user saves
- **THEN** the PolymerBond remains on the canvas
- **THEN** the bond's endpoint on this monomer is now the new atom associated with AP R1

#### Scenario: Swapping two in-use APs

- **WHEN** a monomer with bonds on R1 and R2 is edited in the wizard
- **AND** the user swaps the positions of R1 and R2 (moves R1 to the atom previously holding R2, and R2 to the atom previously holding R1)
- **AND** the user saves
- **THEN** both bonds remain on the canvas with their endpoints updated to match the new atom assignments

### Requirement: Bond reconciliation applied to all instances in edit-all mode

When "Edit All Monomers" is used and the new template changes AP assignments, the bond deletion and reconnection rules SHALL be applied to every instance of the affected monomer on the canvas.

#### Scenario: All instances lose bond when AP deleted in edit-all mode

- **WHEN** a monomer used 3 times on canvas (all with bonds on AP R2) is edited using "Edit All Monomers"
- **AND** AP R2 is removed from the template
- **AND** the user saves
- **THEN** all 3 bonds on AP R2 across all 3 instances are deleted from the canvas

#### Scenario: All instances reconnected when AP moved in edit-all mode

- **WHEN** a monomer used 2 times on canvas (all with bonds on AP R1) is edited using "Edit All Monomers"
- **AND** AP R1 is moved to a different atom
- **AND** the user saves
- **THEN** both bonds remain on the canvas with their endpoint atoms updated on both instances
