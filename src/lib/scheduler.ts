/**
 * Orchestrates task execution using the modern Task Scheduling API,
 * falling back to idle callbacks for legacy support.
 */

export interface SchedulerPostTaskOptions {
	priority?: "user-blocking" | "user-visible" | "background";
	delay?: number;
	signal?: AbortSignal;
}

export interface Scheduler {
	postTask<T = void>(
		callback: () => T | Promise<T>,
		options?: SchedulerPostTaskOptions
	): Promise<T>;
}

export const supportsScheduler =
	typeof window !== "undefined" && "scheduler" in window && "TaskController" in window;

/**
 * Creates a function that executes the callback with 'background' priority
 * after a specified delay, aborting any pending execution if triggered again.
 *
 * @template Args - The argument types of the original function.
 * @param {(...args: Args) => void} fn - The operation to perform.
 * @param {number} delay - Debounce delay in milliseconds.
 * @returns {(...args: Args) => void} The callable wrapper.
 */
export const createBackgroundScheduler = <Args extends any[]>(
	fn: (...args: Args) => void,
	delay: number = 500
): ((...args: Args) => void) => {
	if (supportsScheduler) {
		return createPostTaskScheduler(fn, delay);
	}
	return createIdleScheduler(fn, delay);
};

// region Internal Strategies

const createPostTaskScheduler = <Args extends any[]>(
	fn: (...args: Args) => void,
	delay: number
): ((...args: Args) => void) => {
	let controller: TaskController | undefined;

	return (...args: Args) => {
		if (controller) controller.abort();

		// We can safely cast because we checked support in createBackgroundScheduler
		const ControllerClass = window.TaskController as new () => TaskController;
		controller = new ControllerClass();

		window.scheduler
			?.postTask(() => fn(...args), {
				priority: "background",
				delay,
				signal: controller.signal
			})
			.catch((err: unknown) => {
				// Ignore errors caused by aborting the task (debouncing)
				if (err instanceof Error && err.name === "AbortError") return;
				throw err;
			});
	};
};

const createIdleScheduler = <Args extends any[]>(
	fn: (...args: Args) => void,
	delay: number
): ((...args: Args) => void) => {
	let timerId: number | undefined;
	let idleId: number | undefined;

	// Fallback for environments without requestIdleCallback
	const schedule =
		typeof window.requestIdleCallback === "function"
			? window.requestIdleCallback
			: (cb: IdleRequestCallback) => setTimeout(cb, 1);

	const cancel =
		typeof window.cancelIdleCallback === "function"
			? window.cancelIdleCallback
			: clearTimeout;

	return (...args: Args) => {
		if (timerId) clearTimeout(timerId);
		if (idleId) cancel(idleId);

		timerId = window.setTimeout(() => {
			idleId = schedule(() => fn(...args), { timeout: 2000 });
		}, delay);
	};
};
