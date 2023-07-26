import $ from "jquery";

import {
  config,
  Config,
  Dummy,
  decryptAllMessages,
  downloadRequiredLibraryIfMissing
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
  UserData,
} from "lib";

import { encryptionButton, encryptionInput, updatePanel } from "lib/components";
 
downloadRequiredLibraryIfMissing();

export default !window.ZeresPluginLibrary ? Dummy : (([Plugin, Api]) => {
  const plugin = (Plugin, Api) => {
    const {
      DiscordModules,
      WebpackModules,
      Toasts,
      DiscordClasses,
      Utilities,
      DOMTools,
      ColorConverter,
      ReactTools,
    } = Api;

    return class Encryption extends Plugin {
      script: Config;
      userData: UserData;
      components: any;

      /*
       * Define global variables
       */
      constructor() {
        super();

        //  Script metadata
        this.script = { ...config };

        //  Load user data from local storage
        this.userData = getUserData();

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
        /*
         * Makes sure button is always injected
         * Re-inject button when user changes chat/channel
         */
        this.bootstrapUi();

        // log("WebpackModules", WebpackModules.getByProps("DEFAULT_AVATARS"));

        // $(`div[role="textbox"]`).addEventListener(
        //   "keydown",
        //   (e) => {
        //     if (e.which !== 13) return;
        //     const message = $(
        //       `div[role="textbox"] [data-slate-string="true"]`
        //     ).textContent;

        //     if (
        //       isEncryptionOn(this.userData, getChannelId()) &&
        //       !isMessageEncrypted(message) &&
        //       message.length > 0
        //     ) {
        //       e.preventDefault();
        //       e.stopPropagation();
        //       $(`div[role="textbox"]`).focus();

        //       $(`div[role="textbox"]`).sendkeys(
        //         PREFIX +
        //           encrypt(
        //             message,
        //             getOrCreateUserData(this.userData, getChannelId())
        //           )
        //       );
        //     }
        //   },
        //   false
        // );
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
        this.components.updatePanel = updatePanel(this.script, this.userData);
        this.components.encryptionButton = encryptionButton(
          this.script,
          this.userData
        );
        this.components.encryptionInput = encryptionInput(
          this.script,
          this.userData
        );
      }

      bootstrapUi() {
        /*
         * Inject UI elements. Decode messages.
         */
        this.components.encryptionInput.toggleInput("hide");

        const channelId = getChannelId() || "global";
        const channelState = getOrCreateUserData(this.userData, channelId);

        this.components.encryptionButton.inject();
        channelState.state && decryptAllMessages(channelState);
      }

      sendMessage(message: string) {
        var DiscordLocalStorageProxy = document.createElement("iframe");
        DiscordLocalStorageProxy.style.display = "none";
        DiscordLocalStorageProxy.id = "DiscordLocalStorageProxy";
        document.body.appendChild(DiscordLocalStorageProxy);
        var token =
          DiscordLocalStorageProxy.contentWindow.localStorage.token.replace(
            /"/g,
            ""
          );

        $.ajax({
          type: "POST",
          url:
            "https://discordapp.com/api/channels/" +
            getChannelId() +
            "/messages",
          headers: {
            authorization: token,
          },
          dataType: "json",
          contentType: "application/json",
          data: JSON.stringify({ content: message }),
          error: (req, error, exception) => {
            log("Message failed to send", req.responseText);
          },
        });
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
          const res = await (await fetch(this.script.link.sourceConfig)).text();

          //  Extract latest version from script
          const latestMatch = res.match(/(\d.\d.\d)/);
          const latest = latestMatch == null ? "" : latestMatch[0];

          //  Update global var with latest version
          this.script.version.latest = latest;

          //  Make script versions a number (remove '.')
          const currentVersion = this.script.version.current.replace(/\./g, "");
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
