import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";

const targetVersion = process.env.npm_package_version;

// read minAppVersion from manifest.json and bump version to target version
let manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const { minAppVersion } = manifest;
manifest.version = targetVersion;
writeFileSync("manifest.json", JSON.stringify(manifest, null, "\t"));

// update versions.json with target version and minAppVersion from manifest.json
let versions = JSON.parse(readFileSync("versions.json", "utf8"));
versions[targetVersion] = minAppVersion;
writeFileSync("versions.json", JSON.stringify(versions, null, "\t"));

// update CHANGELOG.md with current date if it exists
if (existsSync("CHANGELOG.md")) {
	const getCurrentDate = () => {
		try {
			return execSync('date +"%Y-%m-%d"', { encoding: 'utf8' }).trim();
		} catch (error) {
			return new Date().toISOString().split('T')[0];
		}
	};

	let changelog = readFileSync("CHANGELOG.md", "utf8");
	const currentDate = getCurrentDate();
	const versionHeader = `## [${targetVersion}] - ${currentDate}`;
	
	// Replace unreleased version header with dated version
	changelog = changelog.replace(
		/## \[Unreleased\]/,
		versionHeader
	);
	
	// If no unreleased header found, add version header at the top after title
	if (!changelog.includes(versionHeader)) {
		const lines = changelog.split('\n');
		const insertIndex = lines.findIndex(line => line.startsWith('##')) || 2;
		lines.splice(insertIndex, 0, '', versionHeader, '');
		changelog = lines.join('\n');
	}
	
	writeFileSync("CHANGELOG.md", changelog);
}

// Build the plugin
console.log("Building plugin...");
try {
	execSync("node esbuild.config.mjs production", { stdio: 'inherit' });
	console.log("Build completed successfully");
} catch (error) {
	console.error("Build failed:", error.message);
	process.exit(1);
}
