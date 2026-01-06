export function detectAvailableFonts(fontList: string[], containerEl?: HTMLElement): string[] {
	const baseFonts = ['monospace', 'sans-serif', 'serif'];
	const testString = "mmmmmmmmmmlli";

	// Create test element
	const testElement = document.createElement('span');
	testElement.className = 'font-test-element';
	testElement.textContent = testString;
	
	// Use provided container or fall back to document.body
	const parentElement = containerEl || document.body;
	parentElement.appendChild(testElement);

	// Get baseline measurements
	const baselines: {[key: string]: {width: number, height: number}} = {};
	baseFonts.forEach(baseFont => {
		testElement.className = `font-test-element font-test-${baseFont.replace(/[^a-z]/g, '')}`;
		baselines[baseFont] = {
			width: testElement.offsetWidth,
			height: testElement.offsetHeight
		};
	});

	// Test each font
	const availableFonts: string[] = [];
	const testClassName = 'font-test-current';

	fontList.forEach(font => {
		let isAvailable = false;

		baseFonts.forEach(baseFont => {
			// Set CSS variable for font test
			document.documentElement.style.setProperty('--font-detect-test-family', `"${font}", ${baseFont}`);

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
			document.documentElement.style.removeProperty('--font-detect-test-family');
		});

		if (isAvailable || font === 'monospace') {
			availableFonts.push(font);
		}
	});

	// Clean up
	parentElement.removeChild(testElement);

	return availableFonts;
}

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
 * Async detection using DOM measurement
 * Uses chunked DOM measurement to avoid blocking the UI thread
 * Note: document.fonts.check() API is not reliable for detecting installed fonts,
 * so we use DOM measurement which actually tests font rendering
 */
export async function detectAvailableFontsAsync(
	fontList: string[],
	containerEl?: HTMLElement
): Promise<string[]> {
	// Use chunked DOM measurement (reliable method)
	return detectWithDOMMeasurement(fontList, containerEl);
}

/**
 * Chunked DOM measurement (async refactor of existing detectAvailableFonts)
 * Processes fonts in chunks to avoid blocking the UI thread
 */
async function detectWithDOMMeasurement(
	fontList: string[],
	containerEl?: HTMLElement
): Promise<string[]> {
	const baseFonts = ['monospace', 'sans-serif', 'serif'];
	const testString = "mmmmmmmmmmlli";
	const chunkSize = 10;

	// Create test element
	const testElement = document.createElement('span');
	testElement.className = 'font-test-element';
	testElement.textContent = testString;

	// Use provided container or fall back to document.body
	const parentElement = containerEl || document.body;
	parentElement.appendChild(testElement);

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
					// Set CSS variable for font test
					document.documentElement.style.setProperty('--font-detect-test-family', `"${font}", ${baseFont}`);

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
					document.documentElement.style.removeProperty('--font-detect-test-family');
				});

				if (isAvailable || font === 'monospace') {
					availableFonts.push(font);
				}
			}

			// Yield to UI between chunks
			await new Promise(resolve => setTimeout(resolve, 0));
		}

		return availableFonts;
	} finally {
		// Ensure cleanup even if error occurs
		parentElement.removeChild(testElement);
	}
}