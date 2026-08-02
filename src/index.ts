import { getChannel, setLatestVersion, setUpdateAvailable } from "state/actions";

import { encryptionButton, encryptionInput, updatePanel } from "./lib/components";
import {
	PREFIX,
	decryptAllMessages,
	encrypt,
	inject,
	injectLog,
	isEncryptionOn,
	isMessageEncrypted,
	log,
	removeAll,
	styles
} from "./lib/index";
import { store } from "./state/index";

type MessageActions = {
	sendMessage: (...args: any[]) => any;
};

type Dispatcher = {
	dispatch: (...args: any[]) => any;
	subscribe: (...args: any[]) => any;
};

export default class Encryption {
	components: any;
	started = false;
	bootstrapTimeouts: ReturnType<typeof setTimeout>[] = [];

	constructor() {
		injectLog();

		// Stores component data
		this.components = {};
	}

	/*
	 * Runs once on plugin load (before start)
	 */
	load() {
		injectLog();

		// Initialize DOM components
		this.initializeComponents();

		// Check for new version
		this.checkForUpdate();
	}

	/*
	 * Runs each time plugin starts (after load on initial start)
	 */
	start() {
		const messageActions = BdApi.Webpack.getByKeys("sendMessage") as MessageActions;
		const dispatcher = BdApi.Webpack.getByKeys("dispatch", "subscribe", "register", {
			searchExports: true
		}) as Dispatcher;

		if (!messageActions || typeof messageActions.sendMessage !== "function") {
			throw new Error("Could not resolve Discord's message actions module.");
		}

		if (!dispatcher || typeof dispatcher.dispatch !== "function") {
			throw new Error("Could not resolve Discord's dispatcher module.");
		}

		this.started = true;

		// Inject styles
		inject("styles", "head", "append", this.components.styles);

		this.bootstrapUiWithTimeouts();

		// Encrypt outgoing messages before they are sent
		BdApi.Patcher.instead(
			store.state.config.name,
			messageActions,
			"sendMessage",
			async (_, args, originalFunction) => {
				const payload = args[1];
				const message = payload?.content;

				if (
					isEncryptionOn() &&
					typeof message === "string" &&
					message.length > 0 &&
					!isMessageEncrypted(message)
				) {
					const password = getChannel().password;
					const enc = await encrypt(message, password);
					payload.content = PREFIX + enc;
				}

				return originalFunction(...args);
			}
		);

		// Re-run decryption when Discord receives a new message.
		BdApi.Patcher.after(
			store.state.config.name,
			dispatcher,
			"dispatch",
			(_, args) => {
				const event = args[0];

				if (event?.type === "MESSAGE_CREATE") {
					this.bootstrapUiWithTimeouts();
				}
			}
		);
	}

	/*
	 * Runs when plugin has been stopped
	 */
	stop() {
		this.started = false;
		this.bootstrapTimeouts.forEach((timeout) => clearTimeout(timeout));
		this.bootstrapTimeouts = [];

		BdApi.Patcher.unpatchAll(store.state.config.name);

		// Remove all elements that have been injected
		removeAll(`[${store.state.config.name}]`);
	}

	/**
	 * Runs after every channel switch
	 */
	onSwitch() {
		if (!this.started) return;

		this.bootstrapUiWithTimeouts();
		this.components.encryptionInput.toggleInput("hide");
	}

	//--------------------------------------------------------------------
	//--------------------------------------------------------------------

	initializeComponents() {
		/*
		 * CSS
		 */
		this.components.styles = `<style ${store.state.config.name}="styles">
				${styles}
		</style>
		`;

		/*
		 * Register components
		 */
		this.components.updatePanel = updatePanel();
		this.components.encryptionButton = encryptionButton();
		this.components.encryptionInput = encryptionInput();
	}

	bootstrapUi() {
		if (!this.started) return;

		/*
		 * Inject UI elements. Decode messages.
		 */
		this.components.encryptionButton.inject();
		getChannel().enabled && decryptAllMessages();
	}

	bootstrapUiWithTimeouts() {
		if (!this.started) return;

		// Bootstrap UI optimistically (with fallbacks in case messages haven't rendered yet)
		this.bootstrapUi();
		this.scheduleBootstrap(100);
		this.scheduleBootstrap(1000);
	}

	scheduleBootstrap(delay: number) {
		const timeout = setTimeout(() => {
			this.bootstrapTimeouts = this.bootstrapTimeouts.filter(
				(candidate) => candidate !== timeout
			);
			this.bootstrapUi();
		}, delay);

		this.bootstrapTimeouts.push(timeout);
	}

	//--------------------------------------------------------------------
	//--------------------------------------------------------------------

	/*
	 * Checks GitHub for a newer version of the script
	 */
	async checkForUpdate() {
		setUpdateAvailable(false);

		// Skip checking if user has previously chosen to ignore the update
		if (store.state.config.version.ignoreUpdate) return;
		log("Checking for updates...");

		try {
			// Get latest script from GitHub
			const res = await (await fetch(store.state.config.link.sourceConfig)).text();

			// Extract latest version from script
			const latestMatch = res.match(/(\d.\d.\d)/);
			const latest = latestMatch == null ? "" : latestMatch[0];

			// Update global var with latest version
			setLatestVersion(latest);

			// Make script versions a number (remove '.')
			const currentVersion = store.state.config.version.current.replace(/\./g, "");
			const latestVersion = latest.replace(/\./g, "");

			// Compare current and latest version
			if (currentVersion < latestVersion) {
				// Update is available
				setUpdateAvailable(true);
				log(`An update is available! [${currentVersion} => ${latestVersion}]`);

				// add update pop-up to ui
				this.components.updatePanel.inject();
			}
		} catch (err) {
			log.error(`Error checking for updates:`, err);
		}
	}
}
