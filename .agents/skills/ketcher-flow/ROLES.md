# Roles

The roles a flow dispatches, and the model each one runs on. This file is the single place any flow reads a model from.

| Role               | Does                                                           | Claude Code         | Codex                            | GitHub Copilot CLI                     |
| ------------------ | -------------------------------------------------------------- | ------------------- | -------------------------------- | -------------------------------------- |
| orchestrator (you) | runs the flow, writes tickets, decides                         | the session's model | the session's model              | the session's model                    |
| **explorer**       | reads code and docs, writes notes                              | `haiku`             | the fast model, medium effort    | `general-purpose`, the fast model      |
| **diagnoser**      | traces one symptom or bug to its cause                         | `sonnet`            | the default model, high effort   | `general-purpose`, the default model   |
| **designer**       | proposes one design for an interface                           | `sonnet`            | the default model, high effort   | `general-purpose`, the default model   |
| **implementer**    | writes code to a ticket, commits                               | `sonnet`            | the default model, high effort   | `general-purpose`, the default model   |
| **verifier**       | drives the app with `verify-ketcher`                           | `sonnet`            | the default model, medium effort | `general-purpose`, the default model   |
| **merger**         | rebases, re-runs checks, merges a branch into the run's branch | `sonnet`            | the default model, medium effort | `general-purpose`, the default model   |
| **reviewer**       | reads a diff it did not write                                  | `opus`              | the strongest model, high effort | `general-purpose`, the strongest model |

- **Claude Code**: dispatch with the Agent tool and set its `model` from the row. The four reviewer agents in `.claude/agents/` dispatch by `subagent_type`; give them the reviewer row's model.
- **Codex**: dispatch with `spawn_agent`, setting `model` and `reasoning_effort` from the row. Pick the model names from the session's model list. The four reviewer agents are Codex roles too (`.codex/agents/*.toml`, generated from `.claude/agents/`): pass the agent's name as `agent_type`. Review runs on a different model from the implementers.
- **GitHub Copilot CLI**: dispatch through the `task` tool with the agent named in the row, and set the model on the call. Pick the model names from `/model`. Copilot CLI loads `.claude/agents/` as custom agents, so a reviewer agent dispatches by its name.
- **No subagents** (a tool or mode that cannot dispatch, such as an IDE chat without agent mode): you play each role yourself, in the order the flow gives. For each reviewer, start from the diff and the spec alone, as if you had not written the code, and finish one role's report before you start the next.
- **Asking the user** is the orchestrator's job. A subagent that needs the user's answer (an E2E spec, a product decision) stops, puts the question in its report, and the orchestrator asks.
- The user can move any row ("implementers on opus"). Show the table and take overrides when a flow says to.
- **Cascade.** When the same check fails twice, the implementer stops and names the **premise** both attempts shared (_Premise_ in [QUALITY.md](QUALITY.md)). Send the ticket to the next stronger model with that premise as the first thing to test.

## Briefs

Send **context pointers**, not text: a flow file's path, a ticket file, an issue number, a worktree path, a commit. Every implementer brief carries the path of [QUALITY.md](QUALITY.md), the run directory, and these output rules:

- run tests with a short reporter, and print full logs only on failure;
- run `git diff --stat` before `git diff`;
- read files by line range.

Split a ticket that will not finish in about 100K tokens of context before dispatch.
