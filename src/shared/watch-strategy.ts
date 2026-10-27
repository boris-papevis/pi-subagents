import * as path from "node:path";

/** Windows libuv reports deletion of the watched directory as an absolute-path rename. */
export function isWatchTargetRename(event: string, filename: string | Buffer | null, watchPath: string, platform: NodeJS.Platform = process.platform): boolean {
	if (event !== "rename" || !filename) return false;
	const paths = platform === "win32" ? path.win32 : path.posix;
	const name = filename.toString();
	if (!paths.isAbsolute(name)) return false;
	const eventPath = paths.toNamespacedPath(name);
	const targetPath = paths.toNamespacedPath(watchPath);
	return platform === "win32" ? eventPath.toLowerCase() === targetPath.toLowerCase() : eventPath === targetPath;
}

export type FileWatchPurpose =
	| "result-delivery"
	| "supervisor-channel"
	| "async-job-tracker"
	| "retained-nested-route-tracker"
	| "runner-control-inbox"
	| "child-steering-inbox";

export function shouldUseNativeFsWatch(_purpose: FileWatchPurpose, platform: NodeJS.Platform = process.platform): boolean {
	if (_purpose === "retained-nested-route-tracker" && platform === "win32") return false;
	return platform !== "darwin";
}
