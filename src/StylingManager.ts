import { MarkdownView, App, Plugin, debounce } from 'obsidian';
import type { Debouncer } from 'obsidian';
import { CSSGenerator } from './CSSGenerator';
import { StyleInjector } from './StyleInjector';
import type { SourceModeStylingSettings } from './main';

export class StylingManager {
	private app: App;
	private plugin: Plugin;
	private settings: SourceModeStylingSettings;
	private isEnabled = false;

	// Callback functions
	private updateInjectedStyle?: () => void;
	private scheduleViewModeUpdate?: Debouncer<[], void>;

	constructor(app: App, plugin: Plugin, settings: SourceModeStylingSettings) {
		this.app = app;
		this.plugin = plugin;
		this.settings = settings;
		StyleInjector.setDebugMode(settings.debugMode);
	}

	private log(message: string, data?: unknown): void {
		if (this.settings.debugMode) {
			console.debug(`[SourceMode Debug] ${message}`, data !== undefined ? data : '');
		}
	}

	/**
	 * Runs a callback against the source view element of every markdown leaf.
	 * Walking the workspace rather than querying a document covers popout windows,
	 * which a document-scoped query would miss.
	 */
	private forEachEditorEl(callback: (editorEl: Element, view: MarkdownView, index: number) => void): void {
		const leaves = this.app.workspace.getLeavesOfType('markdown');
		this.log(`Found ${leaves.length} markdown leaves`);

		leaves.forEach((leaf, index) => {
			const view = leaf.view;
			if (!(view instanceof MarkdownView)) {
				this.log(`Leaf ${index}: view is not MarkdownView`);
				return;
			}

			const editorEl = view.containerEl.querySelector('.markdown-source-view.mod-cm6');
			if (!editorEl) {
				this.log(`Leaf ${index}: no editor element found`);
				return;
			}

			callback(editorEl, view, index);
		});
	}

	updateSettings(settings: SourceModeStylingSettings) {
		StyleInjector.setDebugMode(settings.debugMode);
		this.log('Settings updated', {
			fontFamily: settings.fontFamily,
			fontSize: settings.fontSize,
			debugMode: settings.debugMode
		});
		this.settings = settings;
		// Trigger update if styling is currently enabled
		if (this.isEnabled && this.updateInjectedStyle) {
			this.log('Triggering style update due to settings change');
			this.updateInjectedStyle();
		}
	}

	enable() {
		if (this.isEnabled) {
			this.log('Enable called but already enabled');
			return;
		}

		this.log('Enabling Source Mode Styling');

		const updateInjectedStyle = () => {
			this.log('Updating injected style');
			const variables = CSSGenerator.generateCSSVariables(this.settings);
			this.log('Generated CSS variables', variables);
			StyleInjector.setCSSVariables(variables);
		};

		const updateViewModeClass = () => {
			this.log('Updating view mode class for all editors');

			// Apply class to each editor based on its individual mode
			this.forEachEditorEl((editorEl, view, index) => {
				const state = view.getState();
				const isSourceMode = state.source === true && state.mode === "source";

				this.log(`Leaf ${index}: ${view.file?.path || 'no file'} - source mode: ${isSourceMode}`, {
					source: state.source,
					mode: state.mode
				});

				editorEl.classList.toggle('source-mode-raw', isSourceMode);
			});

			updateInjectedStyle();
		};

		// One debounced update shared by all three events, which commonly fire together
		// on a single file open. resetTimer is false so a sustained stream of
		// layout-change events (a pane drag, a window resize) still updates every
		// interval instead of being deferred until the stream stops.
		const scheduleViewModeUpdate = debounce(updateViewModeClass, 100, false);
		this.scheduleViewModeUpdate = scheduleViewModeUpdate;

		this.updateInjectedStyle = updateInjectedStyle;

		// Register workspace event listeners using plugin.registerEvent() for proper lifecycle management
		this.plugin.registerEvent(
			this.app.workspace.on("active-leaf-change", (leaf) => {
				this.log('Event: active-leaf-change', {
					leafType: leaf?.view?.getViewType() || 'unknown'
				});
				// Debounced so the DOM has settled before the class is applied
				scheduleViewModeUpdate();
			})
		);

		this.plugin.registerEvent(
			this.app.workspace.on("layout-change", () => {
				this.log('Event: layout-change');
				scheduleViewModeUpdate();
			})
		);

		// Also listen for file-open which fires when a markdown file is opened
		this.plugin.registerEvent(
			this.app.workspace.on("file-open", () => {
				this.log('Event: file-open');
				scheduleViewModeUpdate();
			})
		);

		this.isEnabled = true;
		this.log('Initial view mode update');
		updateViewModeClass();
	}

	disable() {
		if (!this.isEnabled) {
			this.log('Disable called but already disabled');
			return;
		}

		this.log('Disabling Source Mode Styling');

		// Drop any pending update, so it cannot re-apply the class after teardown
		this.scheduleViewModeUpdate?.cancel();
		this.scheduleViewModeUpdate = undefined;

		// Remove class from all editors, popout windows included
		this.forEachEditorEl(editorEl => editorEl.classList.remove('source-mode-raw'));
		this.log('Removed source-mode-raw class from all editors');

		StyleInjector.removeAllVariables();
		this.log('Removed all CSS variables');

		// Reset callback
		this.updateInjectedStyle = undefined;

		this.isEnabled = false;
	}

	getIsEnabled(): boolean {
		return this.isEnabled;
	}
} 