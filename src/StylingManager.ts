import { MarkdownView, App, EventRef } from 'obsidian';
import { CSSGenerator } from './CSSGenerator';
import { StyleInjector } from './StyleInjector';
import type { SourceModeStylingSettings } from './main';

export class StylingManager {
	private app: App;
	private settings: SourceModeStylingSettings;
	private isEnabled = false;
	
	// Event handlers and observers
	private updateBodyModeClass?: () => void;
	private updateInjectedStyle?: () => void;
	private activeLeafChangeHandler?: EventRef;
	private layoutChangeHandler?: EventRef;
	private classCheckInterval?: number;

	constructor(app: App, settings: SourceModeStylingSettings) {
		this.app = app;
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
			const css = CSSGenerator.generateCSS(this.settings);
			StyleInjector.injectCSS(css);
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

		this.updateBodyModeClass = updateViewModeClass;
		this.updateInjectedStyle = updateInjectedStyle;

		// Register workspace event listeners - these fire when views are created/switched
		this.activeLeafChangeHandler = this.app.workspace.on("active-leaf-change", () => {
			// Use setTimeout to ensure DOM is fully rendered
			setTimeout(updateViewModeClass, 50);
		});
		
		this.layoutChangeHandler = this.app.workspace.on("layout-change", () => {
			setTimeout(updateViewModeClass, 50);
		});

		// Also listen for file-open which fires when a markdown file is opened
		this.app.workspace.on("file-open", () => {
			setTimeout(updateViewModeClass, 100);
		});
		
		this.isEnabled = true;
		updateViewModeClass();
	}

	disable() {
		if (!this.isEnabled) return;

		const viewContent = document.querySelector('.workspace-split.mod-root .view-content');
		if (viewContent) {
			viewContent.classList.remove("source-mode-raw");
		}
		StyleInjector.removeCSS();
		
		// Clean up interval (if any)
		if (this.classCheckInterval) {
			clearInterval(this.classCheckInterval);
			this.classCheckInterval = undefined;
		}
		
		// Clean up event listeners
		if (this.activeLeafChangeHandler && this.updateBodyModeClass) {
			this.app.workspace.off("active-leaf-change", this.updateBodyModeClass);
		}
		if (this.layoutChangeHandler && this.updateBodyModeClass) {
			this.app.workspace.off("layout-change", this.updateBodyModeClass);
		}

		// Reset handlers
		this.updateBodyModeClass = undefined;
		this.updateInjectedStyle = undefined;
		this.activeLeafChangeHandler = undefined;
		this.layoutChangeHandler = undefined;
		
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