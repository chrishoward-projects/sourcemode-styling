import type { SourceModeStylingSettings } from './main';
import { MONOSPACE_FONTS } from './constants';
import { hashFontList, detectAvailableFontsAsync } from './fontDetect';

export interface FontCacheResult {
	fonts: string[];
	isFromCache: boolean;
}

/**
 * Checks if the cached font list is valid
 * Cache is valid if it exists and the hash matches current MONOSPACE_FONTS
 */
export function isCacheValid(settings: SourceModeStylingSettings): boolean {
	if (!settings.cachedAvailableFonts) return false;
	const currentHash = hashFontList(MONOSPACE_FONTS);
	return settings.cachedAvailableFonts.fontListHash === currentHash;
}

/**
 * Gets available fonts from cache or detects them
 * Returns cached fonts if valid, otherwise detects and caches
 */
export async function getAvailableFonts(
	settings: SourceModeStylingSettings,
	saveSettings: () => Promise<void>,
	containerEl?: HTMLElement
): Promise<FontCacheResult> {
	// Return from cache if valid
	if (isCacheValid(settings)) {
		return {
			fonts: [...settings.cachedAvailableFonts!.fonts],
			isFromCache: true
		};
	}

	// Detect and cache
	const fonts = await detectAvailableFontsAsync(MONOSPACE_FONTS, containerEl);

	settings.cachedAvailableFonts = {
		fonts: fonts,
		fontListHash: hashFontList(MONOSPACE_FONTS),
		timestamp: Date.now()
	};

	await saveSettings();

	return { fonts: [...fonts], isFromCache: false };
}

/**
 * Invalidates the font cache, forcing re-detection on next load
 */
export function invalidateFontCache(settings: SourceModeStylingSettings): void {
	delete settings.cachedAvailableFonts;
}
