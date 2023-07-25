//META{ "name":"encryption", "website":"https://github.com/hmerritt/discord-encryption" }*//
import $ from "jquery";

import {
  Config,
  UserData,
  config,
  decryptAllMessages,
  encrypt,
  getChannelId,
  getOrCreateUserData,
  getUserData,
  inject,
  injectLog,
  isEncryptionOn,
  log,
  removeElements,
  styles,
} from "./lib";

import {
  encryptionButton,
  encryptionInput,
  updatePanel,
} from "./lib/components";

export class encryption {
  script: Config;
  userData: UserData;
  components: any;

  /*
   * Define global variables
   */
  constructor() {
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

    //  Inject encryption button on start
    this.components.encryptionButton.inject();

    /*
     * Makes sure button is always injected
     * Re-inject button when user changes chat/channel
     */
    $(document).on(
      "click",
      `[aria-label="Servers"] > div, [aria-label="Channels"] li a, [aria-label="Direct Messages"] li`,
      function () {
        this.components.encryptionInput.toggleInput("hide");

        const channelId = getChannelId() || "global";
        const channelState = getOrCreateUserData(this.userData, channelId);
        setTimeout(() => {
          this.components.encryptionButton.inject();
        }, 88);

        // log("ENC TEST", encrypt("test", { state: true, password: "123" }));

        channelState.state && decryptAllMessages(channelState);
      }.bind(this)
    );
  }

  /*
   * Runs when plugin has been stopped
   */
  stop() {
    //  Remove all elements that have been injected
    removeElements(`[${this.script.name}]`);

    //  Unbind event listners
    $(document).off(
      "click",
      `[aria-label="Servers"] > div, [aria-label="Channels"] li a, [aria-label="Direct Messages"] li`
    );
  }

  //--------------------------------------------------------------------
  //--------------------------------------------------------------------

  /*
   * Creates global components
   */
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

    this.components.encryptionButton.inject();
  }

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
        log(`An update is available! [${currentVersion} => ${latestVersion}]`);

        //  add update pop-up to ui
        this.components.updatePanel.inject();
      }
    } catch (err) {
      log("error", `Error checking for updates: ${err}`);
    }
  }

  //--------------------------------------------------------------------
  //--------------------------------------------------------------------

  getName() {
    return "Encryption";
  }

  getAuthor() {
    return "hmerritt";
  }

  getVersion() {
    return this.script.version.current;
  }

  getDescription() {
    return "Message encryption using AES-256";
  }
}
