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
	
	// Create reusable style element
	const styleEl = document.createElement('style');
	styleEl.id = 'font-detect-test';
	
	fontList.forEach(font => {
		let isAvailable = false;
		
		baseFonts.forEach(baseFont => {
			// Inject CSS rule for this font test
			styleEl.textContent = `.${testClassName} { font-family: "${font}", ${baseFont}; }`;
			document.head.appendChild(styleEl);
			
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
			
			// Clean up the style element
			document.head.removeChild(styleEl);
		});

		if (isAvailable || font === 'monospace') {
			availableFonts.push(font);
		}
	});

	// Clean up
	parentElement.removeChild(testElement);

	return availableFonts;
} 