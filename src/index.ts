//META{ "name":"encryption", "website":"https://github.com/hmerritt/discord-encryption" }*//
import $ from "jquery";
import crypto from "crypto-js";

import {
  config,
  getChannelId,
  inject,
  injectLog,
  log,
  removeElements,
  styles,
} from "./lib";

import { encryptionButton, updatePanel } from "./lib/components";

export class encryption {
  script: typeof config;
  userData: { global: { password: string; state: boolean } };
  components: any;

  // Move these `initializeComponents` to lib
  discord: any;
  encryption: any;

  /*
   * Define global variables
   */
  constructor() {
    //  Script metadata
    this.script = { ...config };

    //  Load user data from local storage
    this.userData = {
      global: {
        password: "",
        state: false,
      },
    };

    if (typeof localStorage !== "undefined") {
      const getUserDataFromStorage = JSON.parse(localStorage[this.script.name]);
      if (getUserDataFromStorage) {
        this.userData = getUserDataFromStorage;
      }
    }

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
  }

  /*
   * Runs when plugin has been stopped
   */
  stop() {
    //  Remove all elements that have been injected
    removeElements(`[${this.script.name}]`);

    //  Unbind event listners
    $(document).off("click", ".da-channel, .da-listItem, .da-containerDefault");
    $(document).off("click", `[${this.script.name}].updatePanel`);
  }

  //--------------------------------------------------------------------
  //--------------------------------------------------------------------

  /*
   * Creates global components
   */
  initializeComponents() {
    /*
     * Encryption
     * -> helper functions to handle the encrypt/decrypting
     */
    this.encryption = {};
    this.encryption.get = {};
    this.encryption.set = {};

    /*
     * Get encryption state for current chat
     * @return bool
     */
    this.encryption.get;
    this.encryption.get.state = () => {
      let channelId = getChannelId() || "";
      let globalState = this.userData.global.state;
      let chatState = this.userData[channelId]
        ? this.userData[channelId].state
        : false;
      if (globalState || chatState) {
        return true;
      }
      return false;
    };

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
    this.components.updatePanel = updatePanel;
    this.components.encryptionButton = encryptionButton;

    /*
     * Makes sure button is always injected
     * Re-inject button when user changes chat/channel
     */
    $(document).on(
      "click",
      ".da-channel, .da-listItem, .da-containerDefault",
      function () {
        this.components.encryptionButton.inject(this.encryption.get.state());
      }.bind(this)
    );
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
