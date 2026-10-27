import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isWatchTargetRename, shouldUseNativeFsWatch, type FileWatchPurpose } from "../../src/shared/watch-strategy.ts";

const purposes: FileWatchPurpose[] = [
	"result-delivery",
	"supervisor-channel",
	"async-job-tracker",
	"runner-control-inbox",
	"child-steering-inbox",
];

describe("watch strategy", () => {
	it("recognizes absolute Windows self-target renames, including namespace paths and buffers", () => {
		const target = "C:\\Users\\operator\\Temp\\results.json";
		for (const filename of [target, target.toLowerCase(), `\\\\?\\${target}`, Buffer.from(`\\\\?\\${target}`)]) {
			assert.equal(isWatchTargetRename("rename", filename, target, "win32"), true);
		}
	});

	it("keeps ordinary child events and relative filenames distinct from self-target renames", () => {
		const target = "C:\\Temp\\results.json";
		for (const filename of [null, "results.json", "child.json", "C:results.json", `${target}\\child.json`]) {
			assert.equal(isWatchTargetRename("rename", filename, target, "win32"), false);
		}
		assert.equal(isWatchTargetRename("change", target, target, "win32"), false);
		assert.equal(isWatchTargetRename("rename", "/tmp/results", "/tmp/results", "linux"), true);
		assert.equal(isWatchTargetRename("rename", "/tmp/RESULTS", "/tmp/results", "linux"), false);
	});
	it("disables native filesystem watchers on Darwin", () => {
		for (const purpose of purposes) assert.equal(shouldUseNativeFsWatch(purpose, "darwin"), false);
	});

	it("keeps native filesystem watchers on non-Darwin platforms", () => {
		for (const purpose of purposes) {
			assert.equal(shouldUseNativeFsWatch(purpose, "linux"), true);
			assert.equal(shouldUseNativeFsWatch(purpose, "win32"), true);
		}
	});
});
