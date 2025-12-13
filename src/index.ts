import { encryptionButton, encryptionInput, updatePanel } from "./lib/components";
import {
	Config,
	Dummy,
	PREFIX,
	config,
	decryptAllMessages,
	downloadRequiredLibraryIfMissing,
	encrypt,
	getChannelId,
	getOrCreateUserData,
	getUserData,
	inject,
	injectLog,
	isEncryptionOn,
	isMessageEncrypted,
	log,
	removeElements,
	styles
} from "./lib/index";

downloadRequiredLibraryIfMissing();

export default !window.ZeresPluginLibrary
	? Dummy
	: (([Plugin, Api]) => {
			const plugin = (Plugin, Api) => {
				const {
					DiscordClasses,
					DiscordModules,
					DOMTools,
					Patcher,
					ReactTools,
					Utilities,
					WebpackModules
				} = Api;

				return class Encryption extends Plugin {
					script: Config;
					components: any;

					/*
					 * Define global variables
					 */
					constructor() {
						super();
						injectLog();

						// Script metadata
						this.script = { ...config };

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

						Patcher.instead(
							DiscordModules.MessageActions,
							"sendMessage",
							async (thisObject, args, originalFunction) => {
								let message = args[1].content;

								if (
									isEncryptionOn(getUserData(), getChannelId()) &&
									!isMessageEncrypted(message) &&
									message?.length > 0
								) {
									const channelPass = getOrCreateUserData(
										getUserData(),
										getChannelId()
									).password;
									const enc = await encrypt(message, channelPass);
									args[1].content = PREFIX + enc;
								}

								return originalFunction.apply(thisObject, args);
							}
						);

						Patcher.after(
							DiscordModules.MessageActions,
							"receiveMessage",
							function (thisObject, args, returnValue) {
								this.bootstrapUiWithTimeouts();
							}.bind(this)
						);
					}

					/*
					 * Runs when plugin has been stopped
					 */
					stop() {
						// Remove all elements that have been injected
						removeElements(`[${this.script.name}]`);
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
						this.components.styles = `<style ${this.script.name}="styles">
								${styles}
						</style>
						`;

						/*
						 * Register components
						 */
						this.components.updatePanel = updatePanel(
							this.script,
							getUserData()
						);
						this.components.encryptionButton = encryptionButton(
							this.script,
							getUserData()
						);
						this.components.encryptionInput = encryptionInput(
							this.script,
							getUserData()
						);
					}

					bootstrapUi() {
						/*
						 * Inject UI elements. Decode messages.
						 */
						this.components.encryptionInput.toggleInput("hide");

						const channelId = getChannelId() || "global";
						const channelState = getOrCreateUserData(
							getUserData(),
							channelId
						);

						this.components.encryptionButton.inject();
						channelState.state && decryptAllMessages(channelState);
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
						// Skip checking if user has previously chosen to ignore the update
						if (this.script.version.ignoreUpdate) return;
						log("Checking for updates...");

						try {
							// Get latest script from GitHub
							const res = await (
								await fetch(this.script.link.sourceConfig)
							).text();

							// Extract latest version from script
							const latestMatch = res.match(/(\d.\d.\d)/);
							const latest = latestMatch == null ? "" : latestMatch[0];

							// Update global var with latest version
							this.script.version.latest = latest;

							// Make script versions a number (remove '.')
							const currentVersion = this.script.version.current.replace(
								/\./g,
								""
							);
							const latestVersion = latest.replace(/\./g, "");

							// Compare current and latest version
							if (currentVersion < latestVersion) {
								// Update is available
								this.script.version.update = true;
								log(
									`An update is available! [${currentVersion} => ${latestVersion}]`
								);

								// add update pop-up to ui
								this.components.updatePanel.inject();
							}
						} catch (err) {
							log("error", `Error checking for updates: ${err}`);
						}
					}
				};
			};

			return plugin(Plugin, Api);
		})(
			window.ZeresPluginLibrary.buildPlugin({
				info: {
					name: config.nameTitle,
					authors: [config.author],
					version: config.version.current,
					description: config.description,
					github: config.link.repository,
					github_raw: config.link.source
				},
				main: "index.js"
			})
		);
