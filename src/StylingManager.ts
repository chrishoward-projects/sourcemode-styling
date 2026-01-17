import { MarkdownView, App, Plugin } from 'obsidian';
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

			// Get all markdown leaves in the workspace
			const leaves = this.app.workspace.getLeavesOfType('markdown');
			this.log(`Found ${leaves.length} markdown leaves`);

			// Apply class to each editor based on its individual mode
			leaves.forEach((leaf, index) => {
				const view = leaf.view;
				if (!(view instanceof MarkdownView)) {
					this.log(`Leaf ${index}: view is not MarkdownView`);
					return;
				}

				// Find the editor element for this specific leaf
				const editorEl = leaf.view.containerEl.querySelector('.markdown-source-view.mod-cm6');
				if (!editorEl) {
					this.log(`Leaf ${index}: no editor element found`);
					return;
				}

				// Check if this specific view is in source mode
				const state = view.getState();
				const isSourceMode = state.source === true && state.mode === "source";

				this.log(`Leaf ${index}: ${view.file?.path || 'no file'} - source mode: ${isSourceMode}`, {
					source: state.source,
					mode: state.mode
				});

				// Apply or remove class based on this editor's mode
				if (isSourceMode) {
					editorEl.classList.add('source-mode-raw');
				} else {
					editorEl.classList.remove('source-mode-raw');
				}
			});

			updateInjectedStyle();
		};

		this.updateInjectedStyle = updateInjectedStyle;

		// Register workspace event listeners using plugin.registerEvent() for proper lifecycle management
		this.plugin.registerEvent(
			this.app.workspace.on("active-leaf-change", (leaf) => {
				this.log('Event: active-leaf-change', {
					leafType: leaf?.view?.getViewType() || 'unknown'
				});
				// Use setTimeout to ensure DOM is fully rendered
				setTimeout(updateViewModeClass, 50);
			})
		);

		this.plugin.registerEvent(
			this.app.workspace.on("layout-change", () => {
				this.log('Event: layout-change');
				setTimeout(updateViewModeClass, 50);
			})
		);

		// Also listen for file-open which fires when a markdown file is opened
		this.plugin.registerEvent(
			this.app.workspace.on("file-open", () => {
				this.log('Event: file-open');
				setTimeout(updateViewModeClass, 100);
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

		// Remove class from all editors
		const editors = document.querySelectorAll('.markdown-source-view.mod-cm6.source-mode-raw');
		editors.forEach(editor => {
			editor.classList.remove('source-mode-raw');
		});
		this.log(`Removed source-mode-raw class from ${editors.length} editors`);

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