/**
 * Hash utility for cache validation
 * Generates a simple hash from font list to detect changes in MONOSPACE_FONTS
 */
export function hashFontList(fonts: string[]): string {
	return fonts.join('|').split('').reduce((hash, char) => {
		return ((hash << 5) - hash) + char.charCodeAt(0) | 0;
	}, 0).toString(36);
}

/**
 * Detects which of the supplied fonts are installed by measuring rendered text
 * dimensions against the generic base families, processing in chunks so the UI
 * thread is not blocked.
 * Note: document.fonts.check() is not reliable for detecting installed fonts,
 * so we measure actual rendering instead.
 */
export async function detectAvailableFontsAsync(
	fontList: string[],
	containerEl?: HTMLElement
): Promise<string[]> {
	const baseFonts = ['monospace', 'sans-serif', 'serif'];
	const testString = "mmmmmmmmmmlli";
	const chunkSize = 10;

	// Use provided container or fall back to the active window's body
	const parentElement = containerEl || activeDocument.body;
	const testElement = parentElement.createSpan({
		cls: 'font-test-element',
		text: testString
	});

	try {
		// Get baseline measurements
		const baselines: {[key: string]: {width: number, height: number}} = {};
		baseFonts.forEach(baseFont => {
			testElement.className = `font-test-element font-test-${baseFont.replace(/[^a-z]/g, '')}`;
			baselines[baseFont] = {
				width: testElement.offsetWidth,
				height: testElement.offsetHeight
			};
		});

		// Test fonts in chunks
		const availableFonts: string[] = [];
		const testClassName = 'font-test-current';

		for (let i = 0; i < fontList.length; i += chunkSize) {
			const chunk = fontList.slice(i, i + chunkSize);

			for (const font of chunk) {
				let isAvailable = false;

				baseFonts.forEach(baseFont => {
					// Set the test variable on the test element itself so it resolves in
					// whichever window the element lives in, including a popout
					testElement.style.setProperty('--font-detect-test-family', `"${font}", ${baseFont}`);

					testElement.className = `font-test-element ${testClassName}`;
					const dimensions = {
						width: testElement.offsetWidth,
						height: testElement.offsetHeight
					};

					// If dimensions changed, the font is available
					if (dimensions.width !== baselines[baseFont].width ||
						dimensions.height !== baselines[baseFont].height) {
						isAvailable = true;
					}

					// Clean up the CSS variable
					testElement.style.removeProperty('--font-detect-test-family');
				});

				if (isAvailable || font === 'monospace') {
					availableFonts.push(font);
				}
			}

			// Yield to UI between chunks
			await sleep(0);
		}

		return availableFonts;
	} finally {
		// Ensure cleanup even if error occurs
		testElement.remove();
	}
}
