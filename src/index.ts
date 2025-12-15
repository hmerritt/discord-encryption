import { getChannel, setLatestVersion, setUpdateAvailable } from "state/actions";

import { encryptionButton, encryptionInput, updatePanel } from "./lib/components";
import {
	Dummy,
	PREFIX,
	decryptAllMessages,
	downloadRequiredLibraryIfMissing,
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

downloadRequiredLibraryIfMissing();

export default !window.ZeresPluginLibrary
	? Dummy
	: (([Plugin, Api]) => {
			const plugin = (Plugin, Api) => {
				const {
					DiscordModules, // https://github.com/zerebos/BDPluginLibrary/blob/a375c48d7af5e1a000ce0d97a6cbbcf77a9461cc/src/modules/discordmodules.js
					Patcher // https://github.com/zerebos/BDPluginLibrary/blob/a375c48d7af5e1a000ce0d97a6cbbcf77a9461cc/src/modules/patcher.js
				} = Api;

				return class Encryption extends Plugin {
					components: any;

					/*
					 * Define global variables
					 */
					constructor() {
						super();
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
						// Inject styles
						inject("styles", "head", "append", this.components.styles);

						this.bootstrapUiWithTimeouts();

						// Encrypt outgoing messages before they are sent
						Patcher.instead(
							DiscordModules.MessageActions,
							"sendMessage",
							async (thisObject, args, originalFunction) => {
								let message = args[1].content;

								if (
									isEncryptionOn() &&
									!isMessageEncrypted(message) &&
									message?.length > 0
								) {
									const password = getChannel().password;
									const enc = await encrypt(message, password);
									args[1].content = PREFIX + enc;
								}

								return originalFunction.apply(thisObject, args);
							}
						);

						// Decrypt incoming messages after they are received
						Patcher.after(
							DiscordModules.MessageActions,
							"receiveMessage",
							() => this.bootstrapUiWithTimeouts()
						);

						// Patch the `dispatch` method to trigger message decryption once a message is received
						BdApi.Patcher.after(
							store.state.config.name,
							DiscordModules.Dispatcher,
							"dispatch",
							(_, args) => {
								const event = args[0];

								if (event.type === "MESSAGE_CREATE") {
									this.bootstrapUiWithTimeouts();
								}
							}
						);
					}

					/*
					 * Runs when plugin has been stopped
					 */
					stop() {
						// Remove all elements that have been injected
						removeAll(`[${store.state.config.name}]`);
						Patcher.unpatchAll();
					}

					/**
					 * Runs after every channel switch
					 */
					onSwitch() {
						this.bootstrapUiWithTimeouts();
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
						/*
						 * Inject UI elements. Decode messages.
						 */
						this.components.encryptionInput.toggleInput("hide");
						this.components.encryptionButton.inject();
						getChannel().enabled && decryptAllMessages();
					}

					bootstrapUiWithTimeouts() {
						// Bootstrap UI optimistically (with fallbacks incase messages haven't rendered yet)
						this.bootstrapUi();

						setTimeout(
							function () {
								this.bootstrapUi();
							}.bind(this),
							100
						);

						setTimeout(
							function () {
								this.bootstrapUi();
							}.bind(this),
							1000
						);
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
							const res = await (
								await fetch(store.state.config.link.sourceConfig)
							).text();

							// Extract latest version from script
							const latestMatch = res.match(/(\d.\d.\d)/);
							const latest = latestMatch == null ? "" : latestMatch[0];

							// Update global var with latest version
							setLatestVersion(latest);

							// Make script versions a number (remove '.')
							const currentVersion =
								store.state.config.version.current.replace(/\./g, "");
							const latestVersion = latest.replace(/\./g, "");

							// Compare current and latest version
							if (currentVersion < latestVersion) {
								// Update is available
								setUpdateAvailable(true);
								log(
									`An update is available! [${currentVersion} => ${latestVersion}]`
								);

								// add update pop-up to ui
								this.components.updatePanel.inject();
							}
						} catch (err) {
							log.error(`Error checking for updates:`, err);
						}
					}
				};
			};

			return plugin(Plugin, Api);
		})(
			window.ZeresPluginLibrary.buildPlugin({
				info: {
					name: store.state.config.nameTitle,
					authors: [store.state.config.author],
					version: store.state.config.version.current,
					description: store.state.config.description,
					github: store.state.config.link.repository,
					github_raw: store.state.config.link.source
				},
				main: "index.js"
			})
		);
