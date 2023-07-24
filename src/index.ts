//META{ "name":"encryption", "website":"https://github.com/hmerritt/discord-encryption" }*//
import $ from "jquery";
import crypto from "crypto-js";

import {
  config,
  elementExists,
  fade,
  inject,
  log,
  removeElements,
  styles,
} from "./lib";

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
     * Discord
     * -> helper functions to handle discord things
     */
    this.discord = {};
    this.discord.get = {};

    //  Get the channel id for current chat
    this.discord.get.channelId = () => {
      return window.location.pathname.split("/").pop();
    };

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
      let channelId = this.discord.get.channelId();
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
     * Encryption button
     * -> displays on every message textbox
     */
    this.components.encryptionButton = {};
    this.components.encryptionButton.html = () => {
      return `
                <button ${
                  this.script.name
                }="encryptionButton" state="${this.encryption.get.state()}" class="encryptionButton">
                    <svg viewBox="0 0 24 24">
                        <path fill d="M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M8.9,6C8.9,4.29 10.29,2.9 12,2.9C13.71,2.9 15.1,4.29 15.1,6V8H8.9V6M16,16H13V19H11V16H8V14H11V11H13V14H16V16Z" />
                    </svg>
                </button>
            `;
    };

    //  Inject component into page
    this.components.encryptionButton.inject = () => {
      inject(
        "encryption-button",
        "button.da-attachButton",
        "after",
        this.components.encryptionButton.html()
      );
    };

    /*
     * Toggle the button state
     * -> changes button color
     */
    this.components.encryptionButton.toggleState = () => {
      //  Get button element
      let $button = $(`[${this.script.name}].encryptionButton`);

      //
      if ($button.attr("state") === "on") {
        $button.attr("state", "off");
      } else {
        $button.attr("state", "on");
      }
    };

    /*
     * Makes sure button is always injected
     * Re-inject button when user changes chat/channel
     */
    $(document).on(
      "click",
      ".da-channel, .da-listItem, .da-containerDefault",
      function () {
        this.components.encryptionButton.inject();
      }.bind(this)
    );

    /*
     * Update panel
     * -> displays when an update is available
     */
    this.components.updatePanel = {};
    this.components.updatePanel.html = () => {
      return `
                <div ${this.script.name}="updatePanel" class="updatePanel animated fadeInUp">
                    <h2>An update is available for the discord encryption plugin!</h2>
                    <span action="close">No Thanks</span>
                </div>
            `;
    };

    /*
     * Closes update panel
     * @param int delay
     */
    this.components.updatePanel.close = (delay = 0) => {
      this.script.version.ignoreUpdate = true;
      fade(`[${this.script.name}].updatePanel`, "out", delay);
    };

    /*
     * Click
     * opens github repo / closes update panel
     */
    $(document).on("click", `[${this.script.name}].updatePanel`, (evt) => {
      //  Check if user clicked close button or ignoreUpdates is on
      if (
        evt["target"]["localName"] !== "span" &&
        !this.script.version.ignoreUpdate
      ) {
        //  Open link to GitHub
        window.open(this.script.link.repository, "_blank");
      }

      //  Close panel
      this.components.updatePanel.close(0);
    });

    /*
     * CSS
     */
    this.components.styles = `
            <style ${this.script.name}="styles">
				${styles}
            </style>
        `;
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

      log(`${latestMatch}`);

      //  Update global var with latest version
      this.script.version.latest = latest;

      //  Make script versions a number (remove '.')
      const currentVersion = this.script.version.current.replace(/\./g, "");
      const latestVersion = latest.replace(/\./g, "");

      log(`${currentVersion} : ${latestVersion}`);

      //  Compare current and latest version
      if (currentVersion < latestVersion) {
        //  Update is available
        this.script.version.update = true;
        log(`An update is available! [${currentVersion} => ${latestVersion}]`);
      }
    } catch (err) {
      log(`Error checking for updates: ${err}`, "error");
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
