# Obsidian Review Remediation Plan

Source: `OBSIDIAN-PLUGIN-REVIEW.md` (42 issues). Process per `OBSIDIAN-REVIEW-PLAYBOOK.md`.

Verified 2026-08-31: every one of the 20 flagged source lines matches current source exactly.
No line drift, nothing already resolved. Lint is currently clean with zero `eslint-disable`
suppressions in `src/`.

Tooling note: this repo uses **npm** (`package-lock.json`), not pnpm. `npm run update-version`
does a patch-only bump. `release.sh` already pushes the branch before tagging.

## Triage

| Finding | Count | Verdict |
|---|---|---|
| `document` in `fontDetect.ts` (6, 11, 33, 48) | 4 | Fix by **deletion** - dead code |
| `document` in `fontDetect.ts` (99, 104, 130, 145) | 4 | Genuine - scope to the test element / container |
| `document` in `StyleInjector.ts` (18, 47) | 2 | Genuine - real popout bug, not just style |
| `document` in `StylingManager.ts` (142) | 1 | Genuine - reuse the leaf iteration already in the file |
| `document` in `settings/BaseSetting.ts` (70) | 1 | Genuine - mechanical |
| `setTimeout` in `StylingManager.ts` (109, 116, 124) | 3 | Genuine - replace all three with one `debounce()` |
| `setTimeout` in `fontDetect.ts` (154) | 1 | Genuine - Obsidian's global `sleep()` |
| `createElement('span')` (fontDetect 6, 99) | 2 | One dies with the dead code; one becomes `createSpan()` |
| `createElement('input')` (BaseSetting 70) | 1 | Genuine - `createEl('input')` |
| `!important` (styles.css:24) | 1 | Genuine - needs DevTools before touching |
| README links to `chrishoward/sourcemode-styling` | 1 | Genuine - should be `chrishoward-projects` |
| `builtin-modules` in package.json | 1 | **False positive** - devDependency, used only in `esbuild.config.mjs` to mark Node builtins external. Never bundled into `main.js`. |
| Transitive vulns: minimatch, ajv, flatted, brace-expansion, picomatch, yaml | 17 | Dev-only, all via `eslint` / `eslint-plugin-obsidianmd`. Not an end-user attack surface, but free to clear - see Phase 5. |
| Missing artifact attestation on 2 release assets | 1 | **Defer.** Categorised under "Other" (informational), not a warning; a plugin reaches Satisfactory with it outstanding. Requires moving release creation from `release.sh` into a GitHub Actions workflow with `actions/attest-build-provenance` - a separate conversation. |
| Malware / vulnerable-dependency scan not available | 2 | Disclosures. Nothing to do. |

## Hard constraint: no Obsidian 1.13.0+ APIs in this work

**Nothing in phases 1-5 may use the settings API introduced in Obsidian 1.13.0
(`getSettingDefinitions()`), or any other 1.13.0+ API.** Adopting it forces `minAppVersion`
from 1.9.14 to 1.13.0, which must be its own separate run and release so users on older
Obsidian keep a working version. That release will carry a notice that subsequent versions
will not run on their Obsidian while the current one keeps working. Out of scope here.

Verified 2026-08-31 - every API this plan reaches for predates 1.13.0 and is present in the
typings actually installed:

| API | Used in | Status |
|---|---|---|
| `debounce()` | Phase 2 | `obsidian.d.ts:1124` |
| `sleep()` | Phase 1 | `obsidian.d.ts:253` |
| `activeDocument` | Phase 1 | `obsidian.d.ts:264` |
| `createEl()` / `createSpan()` | Phase 1 | `obsidian.d.ts:189-191` |
| `getLeavesOfType()`, `view.containerEl` | Phase 2/3 | long-standing |

Installed `obsidian` typings are **1.8.7** (lockfile-pinned; `package.json` says `"latest"`).
`getSettingDefinitions` does not exist in them at all, so the new settings API cannot be
reached by accident without first bumping the `obsidian` devDependency - **do not bump it**
during this work.

`src/settingsTab.ts:22` still uses `display()`. The current scan did **not** flag it. Leave it.

## Phase 1 - Delete and mechanical swaps

No change to styling runtime behaviour. Lint + build is sufficient verification; **no manual
Obsidian test needed** for this phase.

- [x] `src/fontDetect.ts`: delete `detectAvailableFonts` (lines 1-60) entirely. It is dead -
      only `hashFontList` and `detectAvailableFontsAsync` are imported (by `fontCache.ts`),
      and it is a near-verbatim duplicate of `detectWithDOMMeasurement`. Kills 5 findings.
- [x] `src/fontDetect.ts`: collapse the `detectAvailableFontsAsync` one-line passthrough -
      rename `detectWithDOMMeasurement` to the exported name and drop the wrapper.
- [x] `src/fontDetect.ts:99`: `document.createElement('span')` -> `parentElement.createSpan({ cls: 'font-test-element', text: testString })`.
      Use the **element method**, not the bare global `createSpan()` - the global creates in the
      main window's document, the method creates in the container's own document.
      Requires moving the `parentElement` resolution above the element creation.
- [x] `src/fontDetect.ts:104`: `document.body` fallback -> `activeDocument.body`.
- [x] `src/fontDetect.ts:130,145`: set `--font-detect-test-family` on `testElement.style`
      instead of `document.documentElement.style`. This is both the scanner fix and a
      correctness fix - the current code sets the variable on the main window's root while the
      test element may live in a popout settings modal, where it would never inherit.
      Same technique `StylePreview.ts` already uses for its `--preview-*` variables.
- [x] `src/fontDetect.ts:154`: `await new Promise(resolve => setTimeout(resolve, 0))` -> `await sleep(0)`
      (Obsidian global, `obsidian.d.ts:253`).
- [x] `src/settings/BaseSetting.ts:70`: pass the parent into `createInput` and use
      `parent.createEl('input')`; drop the two now-redundant `appendChild` calls at the
      call sites. Verify the swap is 1:1 - the function sets `.type`, `.value`, arbitrary
      attributes and `.className` after creation, all of which stay fine post-create.
- [x] `README.md:28`: `chrishoward/sourcemode-styling` -> `chrishoward-projects/sourcemode-styling`.
      Grep the whole repo for the same stale form while there (`manifest.json` authorUrl is
      already correct; `package.json` has no `repository` field).
- [x] `eslint.config.mjs` globals gap - **confirmed real**: lint failed with
      `'activeDocument' is not defined` and `'sleep' is not defined` (`no-undef`).
      Added `activeDocument`, `activeWindow`, `sleep`, `createEl`, `createDiv`, `createSpan`
      to the existing `globals` block.
- [x] `npm run lint && npm run build`, then `npx eslint src --no-inline-config` to prove
      nothing is hidden behind suppressions.
- [x] Changelog + `npm run update-version` + commit.

**Completed 2026-08-31, released as 0.2.32.** `npm run lint`, `npm run build` and
`npx eslint src --no-inline-config` all clean. `fontDetect.ts` went from 162 lines to 89.
Clears 11 of the 20 code findings. `minAppVersion` unchanged at 1.9.14.

## Phase 2 - StylingManager consolidation

Runtime behaviour change. **Stop and test in Obsidian before committing.**

- [ ] `src/StylingManager.ts:109,116,124`: replace the three bare `setTimeout(updateViewModeClass, 50|50|100)`
      calls with a single `debounce(updateViewModeClass, 100)` from `obsidian`, created once
      alongside `updateViewModeClass` and called by all three event handlers.
      Rationale over the playbook's `window.setTimeout`: it kills all three findings at once,
      removes three uncancelled timers that currently outlive `unload()`, and stops the
      triple-fire when `active-leaf-change`, `layout-change` and `file-open` all land together
      on a single file open. Obsidian's own `debounce` owns the timer, so nothing is flagged.
- [ ] `src/StylingManager.ts:142`: replace `document.querySelectorAll('.markdown-source-view.mod-cm6.source-mode-raw')`
      in `disable()` with the same `this.app.workspace.getLeavesOfType('markdown')` walk already
      used by `updateViewModeClass`, removing the class via each leaf's `view.containerEl`.
      This is the root-cause fix, not just the scanner fix: the current `querySelectorAll` only
      sees the main window, so disabling the plugin leaves `source-mode-raw` stuck on any editor
      in a popout window.
- [ ] Test: source mode styling still applies/removes on leaf change, layout change and file
      open; disabling the plugin clears styling in a popout window too.
- [ ] Changelog + version bump + commit.

## Phase 3 - StyleInjector popout fix (needs sign-off before starting)

`StyleInjector` sets every `--sourcemode-*` variable on `document.documentElement`. Two ways out:

- **(a) Minimal:** `document.documentElement` -> `activeDocument.documentElement`. Satisfies the
  scanner, two-line diff. But it is semantically wrong for multi-window: `activeDocument`
  re-points to whichever window has focus, so variables get written to the focused window's root
  and editors in the other window silently lose their styling.
- **(b) Recommended:** drop root-level variables entirely and set them on the editor element
  itself - the same `.markdown-source-view.mod-cm6` element `StylingManager` already adds
  `source-mode-raw` to, per leaf. CSS variables inherit, so
  `.markdown-source-view.mod-cm6.source-mode-raw .cm-scroller` in `styles.css` keeps resolving
  unchanged. Popouts then work for free and the whole `document`/`activeDocument` question
  disappears rather than being papered over.

  Cost: `StyleInjector.setCSSVariables` / `removeAllVariables` take an element parameter, and
  `StylingManager` calls them inside the loop it already runs over leaves. Roughly the same
  line count as today.

**Decision needed from you before this phase starts.** (b) is the root-cause fix but it
changes where styling lives in the DOM, so it wants real testing.

- [ ] Implement chosen option.
- [ ] Test: styling correct in main window; correct in a popped-out note; correct with a
      popout and the main window both open on source-mode notes; toggling a setting updates
      both; disabling the plugin clears both.
- [ ] Changelog + version bump + commit.

## Phase 4 - Remove `!important` from styles.css:24

`font-size: initial !important` on `.markdown-source-view.mod-cm6.source-mode-raw .cm-header`.
That selector is already (0,4,0), which beats Obsidian's usual `.markdown-source-view.mod-cm6 .cm-header-N`
at (0,2,0) - so the `!important` may well be vestigial, or it may be fighting a rule that
carries its own `!important`, in which case no specificity increase will win.

Per the playbook: **do not guess.** Open DevTools in Obsidian, inspect a heading line in source
mode, and read the actual competing declaration off the Styles pane before editing.

- [ ] Identify the winning rule in DevTools; record it in this file.
- [ ] If it is a plain rule: delete `!important`, raise specificity only if the strikethrough
      says it is needed.
- [ ] If it also uses `!important`: leave ours in place and record here why the finding is
      being accepted rather than fixed.
- [ ] Test headings in source mode across the default theme plus whichever theme you actually use.
- [ ] Changelog + version bump + commit.

## Phase 5 - devDependency bump and rescan

- [ ] Bump `eslint-plugin-obsidianmd` from 0.1.9 to the current 0.4.x, and `eslint` if needed.
      This is what clears the 17 transitive vuln findings (they only reach the plugin through
      lint tooling and are never bundled) - bump the parent, do not pin the transitives.
- [ ] Re-run `npm run lint`. **Expect new violations**: 0.4.x carries rules 0.1.9 does not,
      notably `obsidianmd/ui/sentence-case`.
- [ ] **Carve-out: if the bump surfaces `display()` as deprecated, do not fix it and do not
      inline-suppress it.** Fixing it means the 1.13.0 settings API, which is a separate
      release by the constraint above. Inline `eslint-disable` is worse - the scanner reports
      a disabled `obsidianmd` rule as an error. If it lands as a warning, leave lint noisy and
      record it here. If it lands as an error and blocks the build, set that one rule's
      severity in `eslint.config.mjs` rather than inline: config-level severity appears to be
      tolerated, since this repo already sets `obsidianmd/sample-names` and
      `obsidianmd/no-sample-code` to `"off"` there and the current scan flagged neither.
      Confirm against the next scan rather than assuming.
- [ ] Fix every other new violation by **changing the string**, never with `eslint-disable` - the
      scanner reports a disabled `obsidianmd` rule as an *error*, and separately warns about
      undescribed directive comments, so each suppression would count twice and turn passing
      lint into a failing scan.
- [ ] For any sentence-case violation that is not obvious, test against the rule's own evaluator
      rather than guessing which token is at fault. Throwaway `.mjs` **in the project root**
      (module resolution fails elsewhere), deleted afterwards:

      import { evaluateSentenceCase } from "eslint-plugin-obsidianmd/dist/lib/rules/ui/sentenceCaseUtil.js";
      const r = evaluateSentenceCase(text, { enforceCamelCaseLower: true });
      console.log(r.ok, r.suggestion);

      `{ enforceCamelCaseLower: true }` matters - it is what `obsidianmd.configs.recommended`
      passes, and omitting it gives false passes.
- [ ] `npm run lint && npm run build && npx eslint src --no-inline-config`.
- [ ] Changelog + version bump + commit.
- [ ] **Re-run the submission scan and treat its output as the deliverable.** Clean lint is
      necessary but not sufficient - the scanner enforces things no rule in
      `eslint-plugin-obsidianmd` covers. Do not call this closed on lint alone.

## Deliberately not doing

- **Artifact attestation.** Needs `release.sh` replaced by a GitHub Actions workflow. Separate
  conversation. Note the scan already reports the release `main.js` reproduced byte-for-byte
  from source, which is what an attestation would formally certify. It will stay listed under
  "Other" after this work; that is expected, not a failure.
- **`builtin-modules` replacement.** False positive, reasoning in the triage table above.
- **`display()` -> `getSettingDefinitions()` migration.** Its own run and release, per the hard
  constraint above. Not flagged by the current scan. When it happens: `minAppVersion` goes to
  1.13.0, `versions.json` keeps serving the last 1.9.14-compatible build to users on older
  Obsidian automatically (the map already records that boundary - 0.2.17 and earlier are pinned
  to 0.15.0), and the release notes carry the notice that later versions will not run on their
  Obsidian while the installed one keeps working.
