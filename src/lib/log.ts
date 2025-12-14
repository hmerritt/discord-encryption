/* eslint-disable no-console */
import dayjs from "dayjs";

import { padChar } from "./helpers";

/**
 * Internal log store class. Keeps track of log times and counts per namespace.
 *
 * Injects into global object as `window.logStore`.
 */
export class LogStore {
	defaultNamespace: string;
	logStore: Record<string, [number, number]>;

	constructor() {
		this.defaultNamespace = "_log";
		this.logStore = {
			_log: [Date.now(), 1]
		};
	}

	get(namespace = this.defaultNamespace) {
		return this.logStore?.[namespace];
	}

	getTime(namespace = this.defaultNamespace) {
		return this.logStore?.[namespace]?.[0] || Date.now();
	}

	getCount(namespace = this.defaultNamespace) {
		return this.logStore?.[namespace]?.[1] || 1;
	}

	set(namespace = this.defaultNamespace, time = Date.now(), count = 1) {
		return (this.logStore[namespace] = [time, count]);
	}

	increment(namespace = this.defaultNamespace) {
		return this.set(namespace, Date.now(), this.getCount(namespace) + 1);
	}
}

export type LogStoreType = LogStore;

export type LogLevels = 0 | 1 | 2 | 3 | 4;
export type LogLevelOff = 0;
export type LogLevelError = 1;
export type LogLevelWarn = 2;
export type LogLevelInfo = 3;
export type LogLevelDebug = 4;

enum ConsoleFunctions {
	debug = "debug",
	error = "error",
	info = "info",
	log = "log",
	table = "table",
	trace = "trace",
	warn = "warn",
	group = "group",
	groupEnd = "groupEnd",
	groupCollapsed = "groupCollapsed"
}

type chars = string | number;
const styles = ["color: #888"].join(";");
const timestamp = () => dayjs().format("HH:mm:ss.SSS");
const padStr = (str: chars = "", c = 5) => padChar(str, c, " ", true);

const populateLogFn = (logFn: LogFn | LognFn, fnHasNamespace = false) => {
	for (const funcName of Object.values(ConsoleFunctions)) {
		if (typeof console[funcName] === "function") {
			if (fnHasNamespace) {
				logFn[funcName] = ((namespace: string, ...args: any[]) =>
					_log(namespace, funcName, ...args)) as LognFn;
			} else {
				logFn[funcName] = (...args: any[]) =>
					_log(window.logStore.defaultNamespace, funcName, ...args);
			}
		} else {
			// Handle cases where a method might not exist in all environments
			logFn[funcName] = (..._: any) => {};
		}
	}
};

const timestampString = (diff: chars, namespace?: string) => {
	const ts = `%c${timestamp()} +${padStr(diff)}%s`;

	if (namespace === window.logStore.defaultNamespace) {
		return ts;
	}

	const ns = padStr(namespace, 10);
	// const count = `x${padStr(window.logStore.getCount(namespace), 4)}`; // Log Count (not being used)

	return `${ts} ${ns}`;
};

/**
 * Enforce current log level
 */
const logLevelIsValid = (consoleFn: ConsoleFunctions) => {
	if (
		window.logLevel === 0 ||
		(window.logLevel <= 3 && consoleFn === ConsoleFunctions.debug) ||
		(window.logLevel <= 2 &&
			(consoleFn === ConsoleFunctions.info ||
				consoleFn === ConsoleFunctions.log)) ||
		(window.logLevel <= 1 && consoleFn === ConsoleFunctions.warn)
	)
		return false;
	return true;
};

/**
 * Internal log function. Handles namespace, timestamp, and log level.
 */
const _log = (namespace: string, consoleFn: any, ...args: any[]) => {
	if (!logLevelIsValid(consoleFn)) return;
	const timeElapsed = dayjs().diff(window.logStore.getTime(namespace), "millisecond");
	const stringToLog = timestampString(timeElapsed, namespace);
	window.logStore.increment(namespace);

	// Special case for table. No timestamp or styles as it messes with the table.
	if (consoleFn === "table") {
		return console.table(...args);
	}

	if (ConsoleFunctions[consoleFn as ConsoleFunctions]) {
		console[ConsoleFunctions[consoleFn as ConsoleFunctions]](
			stringToLog,
			styles,
			"",
			...args
		);
	} else {
		console.log(stringToLog, styles, "", consoleFn, ...args);
	}
};

type LogMethods = {
	[K in ConsoleFunctions]: (typeof console)[K];
};
type LognMethods = {
	[K in ConsoleFunctions]: (
		namespace: string,
		message?: any,
		...optionalParams: any[]
	) => void;
};

type LogCallable = typeof console.log;
type LognCallable = (namespace: string, ...args: Parameters<typeof console.log>) => void;

export type LogFn = LogCallable & LogMethods;
export type LognFn = LognCallable & LognMethods;

/**
 * log.
 *
 * Adds a timestamp and timediff to each log automatically.
 */
const logFn: LogCallable = (...args: any[]) => {
	_log(window.logStore.defaultNamespace, "log", ...args);
};

/**
 * Namespaced `log`.
 *
 * @example debug("socket", "msg received") -> "[socket] msg recieved"
 */
const lognFn: LognCallable = (namespace: string, ...args: any[]) => {
	_log(namespace, "log", ...args);
};

populateLogFn(logFn as LogFn, false);
populateLogFn(lognFn as LognFn, true);

export const log = logFn as LogFn;
export const logn = lognFn as LognFn;

export const injectLog = () => {
	window.logStore = new LogStore();
	window.logLevel = 4;
	window.log = log;
	window.logn = logn;
};
