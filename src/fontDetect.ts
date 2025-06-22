export function detectAvailableFonts(fontList: string[], containerEl?: HTMLElement): string[] {
	const baseFonts = ['monospace', 'sans-serif', 'serif'];
	const testString = "mmmmmmmmmmlli";
	const testSize = "72px";

	// Create test element
	const testElement = document.createElement('span');
	testElement.style.fontSize = testSize;
	testElement.className = 'font-test-element';
	testElement.textContent = testString;
	
	// Use provided container or fall back to document.body
	const parentElement = containerEl || document.body;
	parentElement.appendChild(testElement);

	// Get baseline measurements
	const baselines: {[key: string]: {width: number, height: number}} = {};
	baseFonts.forEach(baseFont => {
		testElement.style.fontFamily = baseFont;
		baselines[baseFont] = {
			width: testElement.offsetWidth,
			height: testElement.offsetHeight
		};
	});

	// Test each font
	const availableFonts: string[] = [];
	fontList.forEach(font => {
		let isAvailable = false;
		baseFonts.forEach(baseFont => {
			testElement.style.fontFamily = `"${font}", ${baseFont}`;
			const dimensions = {
				width: testElement.offsetWidth,
				height: testElement.offsetHeight
			};

			// If dimensions changed, the font is available
			if (dimensions.width !== baselines[baseFont].width || 
				dimensions.height !== baselines[baseFont].height) {
				isAvailable = true;
			}
		});

		if (isAvailable || font === 'monospace') {
			availableFonts.push(font);
		}
	});

	// Clean up
	parentElement.removeChild(testElement);

	return availableFonts;
} 