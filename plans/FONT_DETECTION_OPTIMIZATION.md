# Font Detection Performance Optimization (Option 5)

## Goal
Optimize font detection to eliminate 2-3 second delay when opening settings by implementing:
1. Cache detection results in settings
2. Lazy load fonts asynchronously with loading state
3. Use modern Font Loading API with DOM fallback
4. Add manual "Refresh Fonts" button

## Current Problem
- 38 fonts × 3 baselines = 114+ synchronous DOM reflows
- Settings tab freezes for 2-3 seconds on every open
- Font detection runs in `FontFamilySetting` constructor every time

## Implementation Steps

### 1. Extend Settings Schema
**File:** `src/main.ts`

Add to `SourceModeStylingSettings` interface (after line 14):
```typescript
cachedAvailableFonts?: {
    fonts: string[];
    fontListHash: string;  // Detects MONOSPACE_FONTS changes
    timestamp: number;     // Future use for expiration
};
```

**Do NOT** add to `DEFAULT_SETTINGS` - leave undefined for auto-detection on first load.

### 2. Enhance Font Detection
**File:** `src/fontDetect.ts`

Add three new functions:

**a) Hash utility (for cache validation):**
```typescript
export function hashFontList(fonts: string[]): string {
    return fonts.join('|').split('').reduce((hash, char) => {
        return ((hash << 5) - hash) + char.charCodeAt(0) | 0;
    }, 0).toString(36);
}
```

**b) Async detection with Font Loading API:**
```typescript
export async function detectAvailableFontsAsync(
    fontList: string[],
    containerEl?: HTMLElement
): Promise<string[]> {
    // Use document.fonts.check() if available (Chrome 35+, Firefox 41+, Safari 10+)
    if ('fonts' in document && 'check' in document.fonts) {
        return detectWithFontLoadingAPI(fontList);
    }
    // Fallback to chunked DOM measurement
    return detectWithDOMMeasurement(fontList, containerEl);
}
```

**c) Font Loading API implementation:**
```typescript
async function detectWithFontLoadingAPI(fontList: string[]): Promise<string[]> {
    const availableFonts: string[] = [];
    const chunkSize = 10;

    for (let i = 0; i < fontList.length; i += chunkSize) {
        const chunk = fontList.slice(i, i + chunkSize);

        for (const font of chunk) {
            try {
                if (document.fonts.check(`12px "${font}"`) || font === 'monospace') {
                    availableFonts.push(font);
                }
            } catch (e) {
                console.debug(`Font check failed for ${font}:`, e);
            }
        }

        await new Promise(resolve => setTimeout(resolve, 0)); // Yield to UI
    }

    return availableFonts;
}
```

**d) Chunked DOM measurement (refactor existing logic):**
```typescript
async function detectWithDOMMeasurement(
    fontList: string[],
    containerEl?: HTMLElement
): Promise<string[]> {
    // Same algorithm as existing detectAvailableFonts() but:
    // - Wrapped in async function
    // - Process in chunks of 10
    // - await setTimeout(0) between chunks
    // - try/finally for cleanup
}
```

**Keep existing `detectAvailableFonts()` as synchronous fallback.**

### 3. Create Font Cache Module
**File:** `src/fontCache.ts` (NEW)

Create cache management utilities:

```typescript
import type { SourceModeStylingSettings } from './main';
import { MONOSPACE_FONTS } from './constants';
import { hashFontList, detectAvailableFontsAsync } from './fontDetect';

export interface FontCacheResult {
    fonts: string[];
    isFromCache: boolean;
}

export function isCacheValid(settings: SourceModeStylingSettings): boolean {
    if (!settings.cachedAvailableFonts) return false;
    const currentHash = hashFontList(MONOSPACE_FONTS);
    return settings.cachedAvailableFonts.fontListHash === currentHash;
}

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

export function invalidateFontCache(settings: SourceModeStylingSettings): void {
    delete settings.cachedAvailableFonts;
}
```

### 4. Refactor Font Family Setting
**File:** `src/settings/FontFamilySetting.ts`

**Complete rewrite** to support lazy loading and refresh:

Key changes:
- Override `render()` instead of using BaseSetting's auto-rendering
- Create dropdown with "Loading fonts..." initial state (disabled)
- Load fonts asynchronously via `getAvailableFonts()`
- Populate dropdown when fonts load
- Add inline "Refresh Fonts" button
- Handle refresh by invalidating cache and re-detecting

Structure:
```typescript
class FontFamilySetting extends BaseSetting {
    private availableFonts: string[] = [];
    private dropdown: HTMLSelectElement | null = null;
    private refreshButton: HTMLButtonElement | null = null;

    public render(): void {
        // Create Setting with dropdown (disabled, showing "Loading fonts...")
        // Create refresh button (hidden until loaded)
        // Call loadFontsAsync()
    }

    private async loadFontsAsync(): Promise<void> {
        // Call getAvailableFonts() from fontCache module
        // Populate dropdown on success
        // Show refresh button
    }

    private populateDropdown(): void {
        // Clear loading state
        // Add 'theme' option
        // Add detected fonts
        // Ensure current font included
        // Attach change listener
    }

    private async handleRefresh(): Promise<void> {
        // Disable controls, show "Refreshing..."
        // Invalidate cache
        // Re-detect fonts
        // Update dropdown
        // Re-enable controls
    }
}
```

### 5. Update Styles
**File:** `styles.css`

Add refresh button styling (after line 60):
```css
/* Settings UI components */
.source-mode-settings-input-hidden {
    display: none;
}

.setting-item-control button.mod-cta {
    padding: 4px 12px;
    font-size: 13px;
    line-height: 1.4;
}
```

**Also fix typo on line 58:** Change `.source-mode-source-mode-settings-input-hidden` to `.source-mode-settings-input-hidden`

## Performance Impact

**Before:**
- Settings open: 2-3 seconds (blocked)
- 114+ synchronous DOM reflows

**After:**
- First load: ~500-1000ms (background, non-blocking)
- Cached load: < 10ms (instant)
- Font Loading API: ~100-200ms (no reflows)

## Error Handling

Graceful degradation at every level:
1. Font Loading API unavailable → DOM measurement fallback
2. Detection fails → Use full MONOSPACE_FONTS list
3. Cache corrupted → Invalidate and re-detect
4. Any error → Log to console, continue with defaults

## Migration Strategy

No migration needed - automatic:
- Existing users: `cachedAvailableFonts` undefined → detect on first settings open
- New users: Same behavior
- Cache invalidation: Hash mismatch triggers auto re-detection

## Critical Files

1. `src/main.ts` - Add cachedAvailableFonts to settings interface
2. `src/fontDetect.ts` - Add async detection with Font Loading API
3. `src/fontCache.ts` - NEW: Cache management utilities
4. `src/settings/FontFamilySetting.ts` - Refactor to lazy load with refresh
5. `styles.css` - Add button styling, fix typo

## Testing Checklist

- [ ] Fresh install - fonts detect and cache
- [ ] Cached load - instant dropdown population
- [ ] Refresh button - re-detects fonts
- [ ] MONOSPACE_FONTS change - auto-invalidates cache
- [ ] Font Loading API unavailable - falls back gracefully
- [ ] Detection error - uses full font list as fallback
