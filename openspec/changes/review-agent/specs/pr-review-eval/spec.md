## ADDED Requirements

### Requirement: Evaluation set from past pull requests
The evaluation set SHALL be a versioned file that lists past pull requests, each with its base commit, the head commit the maintainer reviewed, and a class: `with-findings` or `clean`. A `with-findings` entry SHALL list the expected findings from the maintainer's change requests: file, line or line range, rule or invariant ID where one applies, and a link to the comment. A `clean` entry SHALL be a pull request merged after its first review without change requests.

#### Scenario: Entry pins the reviewed state
- **WHEN** an entry is added for a pull request that received change requests
- **THEN** its head commit is the commit the maintainer reviewed, not the merged commit

#### Scenario: Expected finding links to its source
- **WHEN** an expected finding is listed
- **THEN** it links to the maintainer comment it was taken from

### Requirement: Model configurations
The evaluation SHALL run the hub with named configurations that each set the finder model and the verifier model. The default set SHALL be Sonnet finders with a Sonnet verifier, Sonnet finders with an Opus verifier, and Opus finders with an Opus verifier. All configurations in one evaluation SHALL use the same set, lenses, rules and hub version.

#### Scenario: One configuration
- **WHEN** the evaluation runs `sonnet-finders-opus-verifier`
- **THEN** every entry is reviewed with Sonnet finders and an Opus verifier

### Requirement: Reuse of finder output
The hub SHALL save the merged finder output of a run and SHALL be able to start a run from saved finder output that runs only verification. Configurations that differ only in the verifier model SHALL reuse the same finder output.

#### Scenario: Two verifier configurations share finders
- **WHEN** the evaluation runs `sonnet-finders-sonnet-verifier` and `sonnet-finders-opus-verifier`
- **THEN** the Sonnet finder passes run once per entry
- **AND** both configurations verify the same saved findings

### Requirement: Evaluation never posts
Evaluation runs SHALL be dry runs: they SHALL NOT post, change labels or read round state from GitHub, and SHALL treat every entry as round 1.

#### Scenario: Merged pull request
- **WHEN** the evaluation reviews a merged pull request
- **THEN** nothing is posted to that pull request

### Requirement: Evaluation report
The evaluation SHALL report, per configuration, recall per severity and in total, false positives, the number of findings the verifier dropped, the estimated cost, and the duration. Recall SHALL count expected findings matched by a confirmed finding. False positives SHALL count confirmed findings on `clean` entries and confirmed findings that a person marked as not real.

#### Scenario: Configurations side by side
- **WHEN** all default configurations have run
- **THEN** the report shows recall, false positives, cost and duration for each configuration side by side

### Requirement: Manual matching
Matching of confirmed findings to expected findings SHALL be recorded in a file that a person fills in or corrects, and the report SHALL be computed from that file.

#### Scenario: Unmatched finding needs a decision
- **WHEN** a confirmed finding on a `with-findings` entry matches no expected finding
- **THEN** it is listed for a person to mark as a real issue the maintainer missed or as a false positive
- **AND** the report counts it according to that decision