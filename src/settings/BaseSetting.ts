import { Setting } from 'obsidian';
import type SourceModeStyling from '../main';

export interface SettingConfig {
	name: string;
	description: string;
	defaultValue: string;
	options?: { value: string; text: string }[];
	inputType?: 'color' | 'number' | 'text';
	inputAttributes?: { [key: string]: string };
}

export abstract class BaseSetting {
	protected plugin: SourceModeStyling;
	protected containerEl: HTMLElement;
	protected config: SettingConfig;

	constructor(containerEl: HTMLElement, plugin: SourceModeStyling, config: SettingConfig) {
		this.containerEl = containerEl;
		this.plugin = plugin;
		this.config = config;
	}

	protected abstract getSettingValue(): string | number;
	protected abstract setSettingValue(value: string | number): void;

	protected createSetting(): void {
		const setting = new Setting(this.containerEl)
			.setName(this.config.name)
			.setDesc(this.config.description);

		if (this.config.options) {
			this.createDropdownWithInput(setting);
		} else {
			this.createSimpleInput(setting);
		}
	}

	private createDropdownWithInput(setting: Setting): void {
		const dropdown = document.createElement('select');
		this.config.options!.forEach(option => {
			const optionElement = document.createElement('option');
			optionElement.value = option.value;
			optionElement.textContent = option.text;
			dropdown.appendChild(optionElement);
		});

		const currentValue = this.getSettingValue();
		const isCustom = this.isCustomValue(currentValue);
		dropdown.value = isCustom ? 'custom' : 'theme';
		setting.controlEl.appendChild(dropdown);

		if (this.config.inputType) {
			const input = this.createInput(isCustom, currentValue);
			setting.controlEl.appendChild(input);
			this.attachDropdownListeners(dropdown, input);
		} else {
			dropdown.addEventListener('change', async () => {
				this.setSettingValue(dropdown.value);
				await this.saveAndTrigger();
			});
		}
	}

	private createSimpleInput(setting: Setting): void {
		const input = this.createInput(true, this.getSettingValue());
		setting.controlEl.appendChild(input);
		this.attachInputListeners(input);
	}

	private createInput(isVisible: boolean, value: string | number): HTMLInputElement {
		const input = document.createElement('input');
		input.type = this.config.inputType || 'text';
		input.value = value.toString();
		
		if (this.config.inputAttributes) {
			Object.entries(this.config.inputAttributes).forEach(([key, val]) => {
				input.setAttribute(key, val);
			});
		}

		if (!isVisible) input.style.display = 'none';
		return input;
	}

	private attachDropdownListeners(dropdown: HTMLSelectElement, input: HTMLInputElement): void {
		dropdown.addEventListener('change', async () => {
			if (dropdown.value === 'custom') {
				input.style.display = '';
				this.setSettingValue(this.parseInputValue(input.value));
			} else {
				input.style.display = 'none';
				this.setSettingValue(dropdown.value);
			}
			await this.saveAndTrigger();
		});

		this.attachInputListeners(input, dropdown);
	}

	private attachInputListeners(input: HTMLInputElement, dropdown?: HTMLSelectElement): void {
		input.addEventListener('input', async () => {
			if (!dropdown || dropdown.value === 'custom') {
				this.setSettingValue(this.parseInputValue(input.value));
				await this.saveAndTrigger();
			}
		});
	}

	private parseInputValue(value: string): string | number {
		if (this.config.inputType === 'number') {
			const num = parseInt(value);
			return isNaN(num) ? value : num;
		}
		return value;
	}

	private isCustomValue(value: string | number): boolean {
		return value !== 'theme' && value !== this.config.defaultValue;
	}

	private async saveAndTrigger(): Promise<void> {
		await this.plugin.saveSettings();
		this.plugin.app.workspace.trigger('layout-change');
	}

	public render(): void {
		this.createSetting();
	}
}