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
	}

	updateSettings(settings: SourceModeStylingSettings) {
		this.settings = settings;
		// Trigger update if styling is currently enabled
		if (this.isEnabled && this.updateInjectedStyle) {
			this.updateInjectedStyle();
		}
	}

	enable() {
		if (this.isEnabled) return;

		const updateInjectedStyle = () => {
			const variables = CSSGenerator.generateCSSVariables(this.settings);
			StyleInjector.setCSSVariables(variables);
		};

		const updateViewModeClass = () => {
			// Try multiple selectors for the container that persists
			const containers = [
				document.querySelector('.workspace-split.mod-root'),
				document.querySelector('.workspace-tabs'),
				document.querySelector('.workspace-leaf'),
				document.body
			];

			const container = containers.find(c => c !== null);
			if (!container) return;

			const modeClasses = ["source-mode-raw"];

			// Remove all mode classes first
			container.classList.remove(...modeClasses);

			if (this.isInSourceMode()) {
				container.classList.add("source-mode-raw");
			}

			updateInjectedStyle();
		};

		this.updateInjectedStyle = updateInjectedStyle;

		// Register workspace event listeners using plugin.registerEvent() for proper lifecycle management
		this.plugin.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				// Use setTimeout to ensure DOM is fully rendered
				setTimeout(updateViewModeClass, 50);
			})
		);

		this.plugin.registerEvent(
			this.app.workspace.on("layout-change", () => {
				setTimeout(updateViewModeClass, 50);
			})
		);

		// Also listen for file-open which fires when a markdown file is opened
		this.plugin.registerEvent(
			this.app.workspace.on("file-open", () => {
				setTimeout(updateViewModeClass, 100);
			})
		);

		this.isEnabled = true;
		updateViewModeClass();
	}

	disable() {
		if (!this.isEnabled) return;

		const viewContent = document.querySelector('.workspace-split.mod-root .view-content');
		if (viewContent) {
			viewContent.classList.remove("source-mode-raw");
		}
		StyleInjector.removeAllVariables();

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
			return false;
		}
		
		const state = activeView.getState();
		return state.source === true && state.mode === "source";
	}
} 