/* eslint-disable no-console */
import execBase from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import util from "util";

const exec = execBase.exec;
const execAwait = util.promisify(exec);

export type Env = [string, any][];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const __root = path.dirname(path.dirname(__dirname));

/**
 * Execute OS commands, awaits response from stdout
 */
export async function run(
	command: string,
	path = __dirname,
	fallback = undefined as any
) {
	try {
		const { stdout } = await execAwait(command, { cwd: path });
		return stdout?.trim();
	} catch (e) {
		if (fallback === undefined) {
			// Should contain code (exit code) and signal (that caused the termination).
			console.error("[run]", e);
		} else {
			console.log("[run] (using fallback)", e);
			return fallback;
		}
	}
}
