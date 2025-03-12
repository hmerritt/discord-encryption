import {
  config,
  Config,
  Dummy,
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
  PREFIX,
  removeElements,
  styles,
} from "lib";

import { encryptionButton, encryptionInput, updatePanel } from "lib/components";

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
          WebpackModules,
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

            //  Script metadata
            this.script = { ...config };

            //  Stores component data
            this.components = {};
          }

          /*
           * Runs once on plugin load (before start)
           */
          load() {
            injectLog();

            //  Initialize DOM components
            this.initializeComponents();

            //  Check for new version
            this.checkForUpdate();
          }

          /*
           * Runs each time plugin starts (after load on initial start)
           */
          start() {
            //  Inject styles
            inject("styles", "head", "append", this.components.styles);

            this.bootstrapUi();

            Patcher.before(
              DiscordModules.MessageActions,
              "sendMessage",
              (t, a) => {
                let message = a[1].content;

                if (
                  isEncryptionOn(getUserData(), getChannelId()) &&
                  !isMessageEncrypted(message) &&
                  message.length > 0
                ) {
                  const enc =
                    PREFIX +
                    encrypt(
                      message,
                      getOrCreateUserData(getUserData(), getChannelId())
                    );

                  a[1].content = enc;
                }
              }
            );

            Patcher.after(
              DiscordModules.MessageActions,
              "receiveMessage",
              function () {
                this.bootstrapUi();

                setTimeout(
                  function () {
                    this.bootstrapUi();
                  }.bind(this),
                  1000
                );
              }.bind(this)
            );
          }

          /*
           * Runs when plugin has been stopped
           */
          stop() {
            //  Remove all elements that have been injected
            removeElements(`[${this.script.name}]`);
          }

          /**
           * Runs after every channel switch
           */
          onSwitch() {
            this.bootstrapUi();

            setTimeout(
              function () {
                this.bootstrapUi();
              }.bind(this),
              1000
            );
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
            const channelState = getOrCreateUserData(getUserData(), channelId);

            this.components.encryptionButton.inject();
            channelState.state && decryptAllMessages(channelState);
          }

          //--------------------------------------------------------------------
          //--------------------------------------------------------------------

          /*
           * Checks GitHub for a newer version of the script
           */
          async checkForUpdate() {
            //  Skip checking if user has previously chosen to ignore the update
            if (this.script.version.ignoreUpdate) return;
            log("Checking for updates...");

            try {
              //  Get latest script from GitHub
              const res = await (
                await fetch(this.script.link.sourceConfig)
              ).text();

              //  Extract latest version from script
              const latestMatch = res.match(/(\d.\d.\d)/);
              const latest = latestMatch == null ? "" : latestMatch[0];

              //  Update global var with latest version
              this.script.version.latest = latest;

              //  Make script versions a number (remove '.')
              const currentVersion = this.script.version.current.replace(
                /\./g,
                ""
              );
              const latestVersion = latest.replace(/\./g, "");

              //  Compare current and latest version
              if (currentVersion < latestVersion) {
                //  Update is available
                this.script.version.update = true;
                log(
                  `An update is available! [${currentVersion} => ${latestVersion}]`
                );

                //  add update pop-up to ui
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
          github_raw: config.link.source,
        },
        main: "index.js",
      })
    );
