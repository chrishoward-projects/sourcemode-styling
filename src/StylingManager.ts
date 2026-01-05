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
			console.log(`[SourceMode Debug] ${message}`, data !== undefined ? data : '');
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
			this.log('Updating view mode class');

			// Try multiple selectors for the container that persists
			const containers = [
				document.querySelector('.workspace-split.mod-root'),
				document.querySelector('.workspace-tabs'),
				document.querySelector('.workspace-leaf'),
				document.body
			];

			const container = containers.find(c => c !== null);

			if (!container) {
				this.log('No container found');
				return;
			}

			const containerInfo = container === document.body ? 'document.body' : container.className;
			this.log(`Using container: ${containerInfo}`);

			const modeClasses = ["source-mode-raw"];

			// Remove all mode classes first
			container.classList.remove(...modeClasses);

			const inSourceMode = this.isInSourceMode();
			this.log(`Is in source mode: ${inSourceMode}`);

			if (inSourceMode) {
				container.classList.add("source-mode-raw");
				this.log('Added source-mode-raw class to container');

				// Diagnostic: Check if class is actually in DOM and CSS is applying
				setTimeout(() => {
					const hasClass = container.classList.contains('source-mode-raw');
					this.log(`DOM check - source-mode-raw class present: ${hasClass}`);

					// Check if CSS variables are accessible
					const rootStyle = getComputedStyle(document.documentElement);
					const fontFamily = rootStyle.getPropertyValue('--sourcemode-font-family');
					this.log('CSS variable check', {
						'--sourcemode-font-family': fontFamily || 'NOT SET',
						'--sourcemode-font-size': rootStyle.getPropertyValue('--sourcemode-font-size') || 'NOT SET'
					});

					// Check actual computed style on the editor
					const editor = document.querySelector('.source-mode-raw .markdown-source-view.mod-cm6 .cm-scroller');
					if (editor) {
						const editorStyle = getComputedStyle(editor);
						this.log('Editor computed styles', {
							'font-family': editorStyle.fontFamily,
							'font-size': editorStyle.fontSize,
							'line-height': editorStyle.lineHeight
						});
					} else {
						this.log('Editor element not found with selector: .source-mode-raw .markdown-source-view.mod-cm6 .cm-scroller');

						// Try to find what editor elements exist
						const allEditors = document.querySelectorAll('.markdown-source-view');
						this.log(`Found ${allEditors.length} .markdown-source-view elements`);
						allEditors.forEach((el, idx) => {
							this.log(`Editor ${idx} classes:`, el.className);
						});
					}
				}, 100);
			} else {
				this.log('Removed source-mode-raw class from container');
			}

			updateInjectedStyle();
		};

		this.updateInjectedStyle = updateInjectedStyle;

		// Register workspace event listeners using plugin.registerEvent() for proper lifecycle management
		this.plugin.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				this.log('Event: active-leaf-change');
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

		const viewContent = document.querySelector('.workspace-split.mod-root .view-content');
		if (viewContent) {
			viewContent.classList.remove("source-mode-raw");
			this.log('Removed source-mode-raw class from view-content');
		}
		StyleInjector.removeAllVariables();
		this.log('Removed all CSS variables');

		// Reset callback
		this.updateInjectedStyle = undefined;

		this.isEnabled = false;
	}

	getIsEnabled(): boolean {
		return this.isEnabled;
	}

	private isInSourceMode(): boolean {
		// Check only the active markdown view - we only want styling for the currently active note
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

		if (!activeView) {
			this.log('No active markdown view found');
			return false;
		}

		const state = activeView.getState();
		this.log('Active view state', {
			source: state.source,
			mode: state.mode,
			file: activeView.file?.path || 'no file'
		});

		const isSourceMode = state.source === true && state.mode === "source";
		return isSourceMode;
	}
} 