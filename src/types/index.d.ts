import { LogFn, LogLevels, LogStoreType, LognFn } from "../lib/log";
import { Scheduler } from "../lib/scheduler";

type BdApiPartial = {
	ContextMenu: any;
	DOM: any;
	Data: {
		delete: (pluginName: string, key: string) => void;
		load: (pluginName: string, key?: string) => any;
		save: (pluginName: string, key: string, data: any) => void;
	};
	Patcher: any;
	Plugins: any;
	React: any;
	ReactDOM: any;
	ReactUtils: any;
	Themes: any;
	UI: any;
	Utils: any;
	Webpack: any;
	[x: string]: any;
};

declare global {
	var BdApi: BdApiPartial;
	var ZeresPluginLibrary: any;

	var log: LogFn;
	var logn: LognFn;
	var logLevel: LogLevels;
	var logStore: LogStoreType;

	interface TaskController extends AbortController {
		setPriority(priority: string): void;
	}

	interface Window {
		BdApi: BdApiPartial;
		ZeresPluginLibrary: any;

		log: LogFn;
		logn: LognFn;
		logLevel: LogLevels;
		logStore: LogStoreType;

		scheduler?: Scheduler;
		TaskController?: new (options?: { priority?: string }) => TaskController;
	}

	// Curstom template literal tags (used to minify during build)
	function css(template: TemplateStringsArray, ...args: any[]): string;
	function html(template: TemplateStringsArray, ...args: any[]): string;
}

export {};
