# Obsidian Plugin Review Remediation Playbook

Distilled from actually fixing a 63-issue automated review scan on related-notes-by-tag. This is the *process* that worked, not a repeat of the `obsidian` skill's guideline content — read that skill too, it covers the rules; this covers how to execute against a real scan without wasting time or introducing regressions.

## Process

1. **Cross-check every flagged line against current source before trusting it.** Scan line numbers rot fast — some findings in the last review were already fixed by earlier work, and at least one flagged line had drifted 14 lines from the actual violation. Read the file, don't trust the number.
2. **Triage into buckets before touching code**, and write the triage down as a short table: already resolved / genuine fix needed / false positive (explain why) / skip for now (explain why, and get the user's sign-off if it's a judgment call). Don't silently skip anything — state it.
3. **Group fixes into phases by theme, not by file.** Each phase = one lint+build-verified commit + one changelog entry + one version bump. Ask before starting each phase rather than blitzing all of them in one pass — the user may want to test between phases.
4. **After any phase that touches runtime behaviour** (not pure syntax/type cleanup), stop and ask the user to manually test in Obsidian before committing. Pure mechanical cleanup (DOM helper swaps, dropping redundant casts) doesn't need a re-test if lint+build pass — say so explicitly so the user isn't left wondering.
5. **Save the plan/triage doc into the project's plan folder as you go**, updating checkboxes per phase, not just at the end — it's the record of what was already resolved vs genuinely fixed, and of any corrections made along the way (see below).

## Recurring finding categories

| Finding | Fix | Footgun |
|---|---|---|
| `document` / `setTimeout` / `clearTimeout` | `activeDocument` for DOM lookups, but **`window.setTimeout()`/`window.clearTimeout()` for timers** | **Corrected after review #2, which flagged `activeWindow.setTimeout` — the advice originally given here was wrong.** Split the rule: `activeDocument` for DOM, plain `window` for timers. This is a real bug and not just style — `activeWindow` re-points to whichever window currently has focus, so a timer set on one window and cleared after the user focuses another is never actually cancelled. Note no eslint rule catches this; only the submission scanner does. For listeners, if the class extends Obsidian's `Component`, prefer `this.registerDomEvent(el, type, cb)` over manual add/removeEventListener — it self-cleans on `unload()`. Only fall back to plain `activeDocument.addEventListener` when the class isn't a `Component`. |
| `display()` deprecated / settings missing from settings search | Migrate `PluginSettingTab` to `getSettingDefinitions()` (Obsidian 1.13.0+) | Appears as one warning plus one `display` is deprecated note per occurrence, but it is a single job. Not a quick fix: it forces `minAppVersion` to 1.13.0, so it needs its own release and a plan. Users below that keep being served the last compatible version via `versions.json`, which is worth confirming to the user before they worry about stranding anyone. |
| `document.createElement('div'/'span'/'input')` | `createDiv()`/`createSpan()`/`createEl('input', ...)` | Mechanical, but check the call site actually only uses `cls`/`text`/`attr` — if it's doing something `createEl` needs (like appending children before other config), the swap isn't 1:1. |
| Redundant `as X` type assertion after an `instanceof` guard | Delete the assertion | Verify with `tsc --noEmit` before trusting it compiles, not just eyeballing the flow. Watch for closures — `const` bindings keep their narrowed type inside a closure, but if the flagged variable is captured in a callback, check it specifically rather than assuming. Filter out pre-existing unrelated errors from `node_modules/@types/*` in the `tsc` output; they're noise, not your problem. |
| `!important` in CSS | Remove and win on specificity instead | Actually count the specificity of the competing selectors (the rule you're editing vs whatever it needs to beat — Obsidian's own `button`/`.clickable-icon` rules, or a sibling class toggle) before assuming a scoping change is enough. Don't guess the DOM ancestor to scope to — see "mistakes" below. |
| `builtin-modules` in package.json | Usually a false positive | Only flags true if the package is *shipped* in `main.js`. If it's a devDependency used solely inside `esbuild.config.mjs` to mark Node builtins external, it's never bundled — standard practice for Obsidian plugins. State this as a false positive in the triage table rather than silently skipping it. |
| README links to a different/renamed repo | Fix the URL | One-line grep-and-fix; check for the same stale link elsewhere in the repo (CONTRIBUTING, package.json `repository` field, etc.) while you're there. |
| Missing GitHub artifact attestation on release assets | Usually skip | Requires moving release creation into a GitHub Actions workflow with `actions/attest-build-provenance` — a real process change from a manual `release.sh`, not a quick fix. Flag it as a separate future conversation rather than bundling it in. **Confirmed safe to defer:** a plugin can reach a Satisfactory rating with this still outstanding — it is categorised under "Other" (informational), not as a warning. It also matters less when the scan separately reports "Build reproduced the release main.js byte-for-byte", which is what an attestation would formally certify. Don't report it to the user as resolved just because the rating improved — it stays listed. |
| Vault enumeration (`getMarkdownFiles`, `vault.getFiles`) | Nothing to fix | A disclosure of capability, not a defect, and listed under "Other". For a plugin that finds notes by tag it is unavoidable: Obsidian exposes no reverse tag index, so the file list has to be walked. Say so plainly rather than attempting a workaround. |
| Potentially vulnerable transitive dependency (e.g. via `eslint`/`eslint-plugin-obsidianmd`) | Check whether it's runtime or dev-only first | If it only reaches the plugin through a devDependency's own dependency tree (lint tooling, build tooling) and is never bundled into `main.js`, it's not a real attack surface for end users — but it's usually free to clear: try bumping the parent devDependency (`eslint`, `eslint-plugin-obsidianmd`) to a version whose own lockfile pulls a patched transitive version, rather than trying to pin the transitive package directly (which pnpm/npm overrides can do but adds ongoing maintenance weight for a devDependency issue). Not yet battle-tested against a real fix — verify lint still passes after bumping. |

## Two mistakes made this session — don't repeat them

**Don't guess a CSS ancestor selector.** When scoping a rule to beat Obsidian's default specificity without `!important`, the temptation is to reach for a plausible-sounding container class. On this plugin, the obvious-looking `.related-notes-container` was wrong — that's the *sidebar view's* container, but the element being styled was created by a completely different component (a settings-tab button). `grep` for where the element is actually created (`createEl`/`createDiv`/`Setting.addButton` call site) and confirm the real DOM ancestor before writing the selector.

**Don't assume an Obsidian CSS variable means what its name implies.** `--background-modifier-error-hover` sounds like a solid red fill; in several installed themes it's `rgba(255, 20, 20, 0.18)` — a translucent wash, not a fill. `--text-on-accent` sounds like "white text"; it actually means "legible text on the **accent** colour," is redefined multiple different ways even within a single theme, and has a paired `--text-on-accent-inverted` for light accents — pairing it with an *error* background is a semantic mismatch that happens to work by luck in some themes. Before trusting any Obsidian CSS variable's effective colour, grep the installed themes' `theme.css` for how they actually redefine it:

```bash
grep -rhn -- "--the-variable-name:" ~/Library/.../.obsidian/themes/*/theme.css
```

The safe default when in doubt: pair a semantic *text* variable (`--text-error`, `--text-muted`) with a *neutral* background modifier (`--background-modifier-hover`), rather than pairing two colour-coded variables together. Contrast is only actually guaranteed when it follows directly from what a variable is documented to mean — check `docs.obsidian.md` (CSS variables reference), don't infer from the name.

## Addendum: what the second review taught

The first remediation pass scored well on lint and then **failed the next scan on the fixes themselves**. The user's words were "all the work you did on compliance introduced other problems". Three lessons, in order of how much time they cost:

**Never suppress a scanner rule to make lint green.** The earlier pass silenced three genuine `obsidianmd/ui/sentence-case` violations with `// eslint-disable-next-line`. The scanner reports *"Disabling 'obsidianmd/ui/sentence-case' is not allowed"* as an **error**, and separately warns about undescribed directive comments — so each suppression counted twice and turned a passing lint into a failing scan. The fastest way to make lint pass is the one thing guaranteed to fail submission. Fix the string.

**`npm run lint` and the submission scanner are different checks.** The scanner enforces things no rule in `eslint-plugin-obsidianmd` covers — the `activeWindow` timer case above returns nothing when you grep the plugin's entire ruleset. So treat clean lint as necessary but not sufficient, and prove nothing is hidden behind suppressions:

```bash
npx eslint src --no-inline-config
```

**Test UI strings against the rule's own evaluator instead of guessing.** Guessing misidentifies the culprit — in one settings description the obvious suspect was "Zettelkasten", but the actual violation was **"IDs"** (lowercased to "ids"); "Zettelkasten" passed because it sat at a sentence start, where the first token is only capitalised, never lowercased. Also non-obvious: "e.g." parses as a sentence break, so `'e.g. ignore, draft'` demanded `'E.g. Ignore, draft'` — reword to "For example: ..." instead. Write a throwaway `.mjs` **in the project root** (module resolution fails from a scratch directory) and delete it after:

```js
import { evaluateSentenceCase } from "eslint-plugin-obsidianmd/dist/lib/rules/ui/sentenceCaseUtil.js";
const r = evaluateSentenceCase(text, { enforceCamelCaseLower: true });
console.log(r.ok, r.suggestion);
```

`{ enforceCamelCaseLower: true }` matters — it is what `obsidianmd.configs.recommended` passes, and omitting it gives false passes. The rule checks far more than `setName`/`setDesc`: also `setPlaceholder`, `setTooltip`, `addOption` labels, `new Notice(...)`, `createEl({ text })`, `createEl({ attr: { title, placeholder, aria-label } })`, and `setAttribute('title'|'aria-label', ...)`. Template literals containing `${}` are skipped entirely, so interpolated strings escape checking.

**Process consequence:** re-run the scan after a remediation pass and treat the result as the deliverable. Don't report a review as closed on the strength of lint passing.

## Async/promise fixes — the three-way decision

| Situation | Fix |
|---|---|
| True fire-and-forget boundary (command callback, `onLayoutReady`, a DOM click handler with no surrounding async context) | `void theCall()` |
| Inside an already-`async` method, where a caller might reasonably await it | `await theCall()` |
| A DOM `addEventListener` callback needs async logic, but the listener type requires a `void`-returning function | Wrap the body: `element.addEventListener('input', () => { void (async () => { ...await stuff... })(); })` |

## Before starting on the other plugin

Don't assume its tooling matches this repo's. Check for its own equivalents before reusing any of this project's specific commands:
- Does it use `npm`, `pnpm`, or something else — check its own CLAUDE.md/README, don't default to this project's pnpm preference without confirming.
- Does it have a `version-bump.mjs`/`update-version` script, and does it do a `patch`-only bump (this project's does — a manual `package.json` edit is needed for a minor/major bump)?
- Does it have its own `release.sh`, and does it already push the branch before tagging, or does it have the same gap this project had (tag pushed, branch not, so the live `manifest.json` goes stale)?
- Where does *its* plan-tracking convention live — mirror whatever pattern its own `plans/` (or equivalent) folder already uses rather than importing this one wholesale.
