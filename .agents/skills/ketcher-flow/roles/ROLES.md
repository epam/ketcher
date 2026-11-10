# Roles

The roles a flow dispatches, and the model each one runs on.

| Role               | Does                                                                          | Claude Code         | Codex                            | GitHub Copilot CLI                     |
| ------------------ | ----------------------------------------------------------------------------- | ------------------- | -------------------------------- | -------------------------------------- |
| orchestrator (you) | runs the flow, writes tickets, decides                                        | the session's model | the session's model              | the session's model                    |
| task orchestrator  | runs one task of a batch through its flow (SKILL.md, _Dispatched by a batch_) | the session's model | the session's model              | the session's model                    |
| **explorer**       | reads code and docs, writes notes                                             | `haiku`             | the fast model, medium effort    | `general-purpose`, the fast model      |
| **diagnoser**      | traces one symptom to its cause                                               | `sonnet`            | the default model, high effort   | `general-purpose`, the default model   |
| **designer**       | proposes one design of an interface (_Design It Twice_)                       | `sonnet`            | the default model, high effort   | `general-purpose`, the default model   |
| **implementer**    | writes code to a ticket, commits                                              | `sonnet`            | the default model, high effort   | `general-purpose`, the default model   |
| **verifier**       | drives the app with `verify-ketcher`                                          | `sonnet`            | the default model, medium effort | `general-purpose`, the default model   |
| **merger**         | rebases, re-runs checks, merges a branch into the run's branch                | `sonnet`            | the default model, medium effort | `general-purpose`, the default model   |
| **reviewer**       | reads a diff it did not write                                                 | `opus`              | the strongest model, high effort | `general-purpose`, the strongest model |

- **Claude Code**: dispatch with the Agent tool and set its `model` from the row. A task orchestrator dispatches its flow's roles itself, and you resume a stopped one with SendMessage to its agent. Each reviewer is a generic subagent with read-only file tools that reviews one lens of the [code-review skill](../../code-review/SKILL.md): its prompt names that skill, the lens file, and the diff or branch point.
- **Codex**: dispatch with `spawn_agent`, setting `model` and `reasoning_effort` from the row. Pick the model names from the session's model list. A reviewer runs on the default agent, with the skill and lens paths in its prompt. Review runs on a different model from the implementers, unless the user moves a row onto the same model.
- **GitHub Copilot CLI**: dispatch through the `task` tool with the agent named in the row, and set the model on the call. Pick the model names from `/model`. A reviewer runs on `general-purpose`, with the skill and lens paths in its prompt.
- **No subagents** (a tool or mode that cannot dispatch, such as an IDE chat without agent mode): you play each role yourself, in the order the flow gives. For each reviewer, start from the diff and the spec alone, as if you had not written the code, and finish one role's report before you start the next.
- **Asking the user** is the orchestrator's job. A subagent that needs the user's answer (an E2E spec, a product decision) stops, puts the question in its report, and the orchestrator asks.
- The user can move any row ("implementers on opus"). Show the table and take overrides when a flow says to.
- **Cascade.** When the same check fails twice, the implementer stops and names the **premise** both attempts shared (_Premise_ in [QUALITY.md](../shared/QUALITY.md)). Send the ticket to the next stronger model with that premise as the first thing to test.

## Dispatches

Send **context pointers**, not text: a flow file's path, a ticket file, an issue number, a worktree path, a commit. Every implementer dispatch carries the path of [QUALITY.md](../shared/QUALITY.md), the run directory, and these output rules:

- run tests with a short reporter, and print full logs only on failure;
- run `git diff --stat` before `git diff`;
- read files by line range.

Before dispatch, split any ticket that needs more than about 100K tokens of context.
