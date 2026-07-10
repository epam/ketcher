## ADDED Requirements

### Requirement: Search natural amino acids by three-letter code
The monomer library search SHALL recognize the standard three-letter codes for natural amino acids and return the natural amino acid monomer whose single-letter natural analog code corresponds to the searched three-letter code.

Supported mappings SHALL include: `Ala` → `A`, `Asx` → `B`, `Cys` → `C`, `Asp` → `D`, `Glu` → `E`, `Phe` → `F`, `Gly` → `G`, `His` → `H`, `Ile` → `I`, `Xle` → `J`, `Lys` → `K`, `Leu` → `L`, `Met` → `M`, `Asn` → `N`, `Pyl` → `O`, `Pro` → `P`, `Gln` → `Q`, `Arg` → `R`, `Ser` → `S`, `Thr` → `T`, `Sec` → `U`, `Val` → `V`, `Trp` → `W`, `Xaa` → `X`, `Tyr` → `Y`, and `Glx` → `Z`.

#### Scenario: Searching exact three-letter code returns natural amino acid
- **WHEN** the user searches the monomer library for `Trp`
- **THEN** the search results include the natural amino acid monomer with natural analog code `W`

#### Scenario: Searching is case-insensitive
- **WHEN** the user searches the monomer library for `trp`
- **THEN** the search results include the natural amino acid monomer with natural analog code `W`

#### Scenario: Searching ambiguous three-letter code returns ambiguous natural amino acid
- **WHEN** the user searches the monomer library for `Xaa`
- **THEN** the search results include the natural amino acid monomer or ambiguous amino acid library item represented by natural analog code `X`

### Requirement: Preserve existing monomer library search behavior
The monomer library search MUST preserve existing matching for monomer names, full names, IDT aliases, HELM aliases, BILN aliases, AxoLabs aliases, modification types, and supported slash-based IDT search syntax.

#### Scenario: Existing name search still works
- **WHEN** the user searches for text that matches an existing monomer name
- **THEN** the search results include monomers matched by the existing name search behavior

#### Scenario: Existing alias search still works
- **WHEN** the user searches for text that matches an existing supported monomer alias
- **THEN** the search results include monomers matched by the existing alias search behavior

