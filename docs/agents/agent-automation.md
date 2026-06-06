# Agent Automation Tools

This project may use `agent-browser`, `agent-device`, and `proofshot` for browser, device, and visual verification workflows.

These are agent-side tools. Do not add them to app dependencies unless the user explicitly asks for project-local tooling.

## Installation

The AI agent should try to install or resolve these CLIs before asking the user to do manual setup. Ask the user only when npm/global-bin permissions, trust policy, shell configuration, device permissions, or OS prompts block automation.

First check whether each CLI is already available.

```bash
agent-browser --help
agent-device --help
proofshot --help
```

If a CLI is missing, install it globally with `vp`.

```bash
vp install -g agent-browser
agent-browser install

vp install -g agent-device

vp install -g proofshot
proofshot install
```

`proofshot install` is important: it downloads the ProofShot SKILL into the user's agent skill scope so future agents can discover the `proofshot` workflow automatically.

Use `vp info <package>` to check the current published version before using or recommending a pinned install.

```bash
vp info agent-browser
vp info agent-device
vp info proofshot
```

If a global install succeeds but the command is not available in the agent process, check the user's login shell and global npm bin path. The agent process `PATH` may differ from the user's interactive terminal `PATH`.

Use `vp dlx` as a fallback when global installation is blocked or inappropriate. Prefer an exact version over `@latest` for reproducible runs.

```bash
vp dlx agent-browser@<version> --version
vp dlx agent-device@<version> --version
vp dlx proofshot@<version> --version
```

If `vp dlx` is used for `proofshot`, still run the install step with the same package version when the goal is to make the SKILL available to future agents.

```bash
vp dlx proofshot@<version> install
```

When automation fails, report the exact command, exit status, and relevant stderr, then ask the user to run the smallest required command manually.

## Tool Selection

- Use `agent-browser` for web apps, local browser targets, forms, clicks, screenshots, scraping, Electron apps, Slack automation, and browser-based QA.
- Use `agent-device` for iOS, Android, tvOS, and macOS app automation, including navigation, screenshots, logs, network evidence, and performance evidence.
- Use `proofshot` after visual UI work when the user needs proof artifacts: browser recording, screenshots, console errors, server logs, and a generated summary.

For web UI changes in `apps/web`, prefer this sequence:

1. Run the relevant `vp` checks from `docs/agents/vite-plus.md`.
2. Use `proofshot` for visual verification when a browser session and evidence bundle are valuable.
3. Use `agent-browser` for deeper interaction, exploratory QA, or precise browser automation.

For native UI changes in `apps/native`, prefer this sequence:

1. Run the relevant `vp` checks from `docs/agents/vite-plus.md`.
2. Use `agent-device` to inspect the app on the target simulator, emulator, or device.
3. Capture screenshots or logs when the change affects layout, navigation, forms, gestures, safe areas, network behavior, or performance.

## agent-browser

`agent-browser` is a versioned CLI. Before running browser commands, load the workflow guide from the installed CLI so command syntax matches the installed version.

```bash
agent-browser --version
agent-browser skills get core
```

Use the full guide when planning a larger automation task.

```bash
agent-browser skills get core --full
```

Load specialized guides only when relevant.

```bash
agent-browser skills get electron
agent-browser skills get slack
agent-browser skills get dogfood
agent-browser skills get vercel-sandbox
agent-browser skills get agentcore
agent-browser skills list
```

Default browser loop:

1. Start or connect to the target app.
2. Open the target URL.
3. Take an accessibility snapshot and identify `@eN` element refs.
4. Click, fill, scroll, or wait through the workflow.
5. Take screenshots for important states.
6. Verify visible output and console/network errors before reporting success.

The observability dashboard runs on port `4848`. When using a proxied dashboard URL, stay on the dashboard origin; session tabs and streams are proxied internally.

## agent-device

`agent-device` is also versioned. Before the first command or plan, verify the installed CLI and read the installed workflow help.

```bash
agent-device --version
agent-device help workflow
```

Require `agent-device >= 0.14.0`. If the installed version is older, stop and ask the user to upgrade the trusted install or approve an exact-version npm command.

Read specialized help only when relevant.

```bash
agent-device help debugging
agent-device help react-native
agent-device help react-devtools
agent-device help remote
agent-device help macos
agent-device help dogfood
agent-device help settings
```

Default device loop:

1. Open or attach to the app/device.
2. Run a snapshot, usually with interactive refs when available.
3. Inspect state with get/find/is commands from the installed workflow guide.
4. Press, fill, scroll, wait, or navigate.
5. Verify the result with another snapshot or screenshot.
6. Close sessions or leave the app state exactly as requested.

For precise location or coordinate workflows, read `agent-device help settings` first so platform limits come from the installed CLI.

## proofshot

Use `proofshot` after building or modifying UI that should be visually verified in a browser.

Start the session with the dev server command and port. Prefer `--run` so the proof bundle includes server logs.

```bash
proofshot start --run "vp dev" --port 5173 --description "verify the changed web UI"
```

If the app has a workspace-specific dev command or port, use that instead of the example.

Drive the browser and capture important states.

```bash
proofshot exec snapshot -i
proofshot exec open http://localhost:5173
proofshot exec click @e3
proofshot exec fill @e2 "test@example.com"
proofshot exec screenshot changed-state.png
```

Stop the session to collect the video, screenshots, console errors, server errors, and `SUMMARY.md`.

```bash
proofshot stop
```

If a previous session was not stopped cleanly, use `--force` on start. If verification finds a defect, fix it and run a fresh proofshot session rather than reporting stale proof.

When working on a pull request, `proofshot pr` can publish the proof bundle as a PR comment.

```bash
proofshot pr
proofshot pr 42
```

## Reporting

When reporting verification results, include:

- Tool and version used.
- Target URL, app, simulator, emulator, or device.
- Key workflow steps tested.
- Screenshots or proof bundle path when generated.
- Any console, server, device log, or visual issues found.

Do not claim visual or device verification was completed unless the tool actually ran and the final state was inspected.
