//META{ "name":"encryption", "website":"https://github.com/hmerritt/discord-encryption" }*//
class encryption {


    /*
    * Define global variables
    */
    constructor()
    {
        //  Script metadata
        this.script = {
            name: 'encryptionPlugin',
            version: {
                current: '2.0.0',
                latest:  '',
                update:  false,
                ignoreUpdate: false
            },
            link: {
                repository: 'https://github.com/hmerritt/discord-encryption',
                source: 'https://raw.githubusercontent.com/hmerritt/discord-encryption/master/encryption.plugin.js'
            }
        };

        //  Load user data from local storage
        this.userData = localStorage[this.script.name] ?
                        JSON.parse(localStorage[this.script.name]) :
                        {
                            global: {
                                password: "",
                                state:    "off"
                            }
                        };

        //  Stores component data
        this.components = {};
    }


    /*
    * Runs once on plugin load (before start)
    */
    load()
    {
        //  Initialize DOM components
        this.initializeComponents();

        //  Check for new version
        this.checkForUpdate();
    }


    /*
    * Runs each time plugin starts (after load on initial start)
    */
    start()
    {
        //  Inject required scripts
        //  -> crypto-js
        this.injectScript('cryptojs', 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.min.js');

        //  Inject styles
        this.inject('styles', 'head', 'append', this.components.styles);

        //  TODO: Inject lock icon into messages page
    }


    /*
    * Runs when plugin has been stopped
    */
    stop()
    {
        //  Remove all elements that have been injected
        this.removeElements(`[${this.script.name}]`);

        //  Unbind event listners
        $(document).off('click', '.da-channel, .da-listItem, .da-containerDefault');
    }


    /*
    * Creates a log in the console
    * @param string msg
    * @param string type
    */
    log(msg, type="")
    {
        const prefix = `[${this.script.name}]`;
        switch(type)
        {
            case "error":
                console.error(prefix, msg);
                break;

            case "warning":
                console.warn(prefix, msg);
                break;

            default:
                console.log(prefix, msg);
        }
    }


    //--------------------------------------------------------------------
    //--------------------------------------------------------------------


    /*
    * Checks if an element exists in the DOM
    * @param string querySelector
    * @return bool
    */
    elementExists(querySelector)
    {
        if ($(querySelector).length === 0) return false;
        return true;
    }


    /*
    * Remove all elements matching a query
    * @param string querySelector
    */
    removeElements(querySelector)
    {
        $(querySelector).remove();
    }


    /*
    * Inject content into the page
    * @param string querySelector
    * @param string how
    * @param string content
    */
    inject(name, querySelector, how, content)
    {
        //  Check if element has already been injected
        if (!this.elementExists(`[${this.script.name}=${name}]`))
        {
            //  Decide how to add the content into the page
            switch(how)
            {
                case "append":
                    $(querySelector).append(content);
                    break;

                case "prepend":
                    $(querySelector).prepend(content);
                    break;

                case "after":
                    $(querySelector).after(content);
                    break;

                case "before":
                    $(querySelector).before(content);
                    break;
            }
        }
    }


    /*
    * Inject a script into the page
    * @param string name
    * @param string url
    */
    injectScript(name, url)
    {
        //  Inject script into 'head'
        this.inject(name, 'head', 'append', `
            <script ${this.script.name}="${name}" src="${url}">
        `);
    }


    /*
    * Fade an object in/out
    * @param string querySelector
    * @param string fadeType
    */
    fade(querySelector, fadeType, delay=0)
    {
        setTimeout(function()
        {
            if (fadeType === 'in')
            {
                $(querySelector)
                  .removeClass('fadeOutDown')
                  .addClass('fadeInUp');
            }
            else if (fadeType === 'out')
            {
                $(querySelector)
                  .removeClass('fadeInUp')
                  .addClass('fadeOutDown');
                setTimeout(function()
                {
                    $(querySelector).remove();
                }, 500);
            }
        }, delay);
    }


    /*
    * Creates global components
    */
    initializeComponents()
    {


        /*
        * Encryption button
        * -> displays on every message textbox
        */
        this.components.encryptionButton = {};
        this.components.encryptionButton.html = () =>
        {
            return `
                <button ${this.script.name}="encryptionButton" state="off" class="encryptionButton">
                    <svg viewBox="0 0 24 24">
                        <path fill d="M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M8.9,6C8.9,4.29 10.29,2.9 12,2.9C13.71,2.9 15.1,4.29 15.1,6V8H8.9V6M16,16H13V19H11V16H8V14H11V11H13V14H16V16Z" />
                    </svg>
                </button>
            `;
        }

        //  Inject component into page
        this.components.encryptionButton.inject = () =>
        {
            this.inject(
              'encryption-button',
              'button.da-attachButton',
              'after',
              this.components.encryptionButton.html()
            );
        }

        /*
        * Toggle the button state
        * -> changes color
        */
        this.components.encryptionButton.toggleState = () =>
        {
            //  Get button element
            let $button = $(`[${this.script.name}].encryptionButton`);

            //
            if ($button.attr('state') === 'on')
            {
                $button.attr('state', 'off');
            }
            else
            {
                $button.attr('state', 'on');
            }
        }

        $(document).on('click', '.da-channel, .da-listItem, .da-containerDefault', function()
        {
            this.components.encryptionButton.inject();
        }.bind(this));


        /*
        * Update panel
        * -> displays when an update is available
        */
        this.components.updatePanel = {};
        this.components.updatePanel.html = () =>
        {
            return `
                <div ${this.script.name}="updatePanel" class="updatePanel animated fadeInUp">
                    <h2>An update is available for the discord encryption plugin!</h2>
                    <span action="close">No Thanks</span>
                </div>
            `;
        }

        /*
        * Closes update panel
        * @param int delay
        */
        this.components.updatePanel.close = (delay=0) =>
        {
            this.script.version.ignoreUpdate = true;
            this.fade(`[${this.script.name}].updatePanel`, 'out', delay);
        };

        //  Click
        //  opens github repo / closes panel
        $(document).on('click', `[${this.script.name}].updatePanel`, (evt) =>
        {
            // Check if user clicked button or ignoreUpdates is on
            if (evt['target']['localName'] !== 'span' && !this.script.version.ignoreUpdate)
            {
                //  Open link to GitHub
                window.open(this.script.link.repository, '_blank');
            }

            //  Close panel
            this.components.updatePanel.close(0);
        });


        /*
        * CSS
        */
        this.components.styles = `
            <style ${this.script.name}="styles">

                .da-attachWrapper {
                  display: flex;
                }

                .encryptionButton {
                  padding: 0 10px;
                  height: 44px;
                  top: 0;
                  background: none;
                  border-left: 1px solid var(--background-primary);
                  -webkit-transition: all 280ms ease;
                          transition: all 280ms ease;
                }
                .encryptionButton svg {
                  width: 24px;
                  height: 24px;
                }

                .encryptionButton[state=on] path {
                  fill: #43b581;
                }
                .encryptionButton[state=off] path {
                  fill: #B9BBBE;
                }

                .encryptionButton[state=on]:hover path {
                  fill: #1C9C6D;
                }
                .encryptionButton[state=off]:hover path {
                  fill: #dedede;
                }


                .updatePanel {
                  position: absolute;
                  display: flex;
                  align-items: center;
                  top: -10px;
                  left: 0px;
                  width: 100%;
                  height: 40px;
                  z-index: 10;
                  overflow: hidden;
                  cursor: pointer;
                  border-radius: 5px;
                  background-color: #7289DA;
                  -webkit-user-select: none;
                          user-select: none;
                  -webkit-transition: all 280ms ease 40ms;
                          transition: all 280ms ease 40ms;
                }
                .updatePanel:hover {
                  background-color: #677bc4;
                }
                .updatePanel:active {
                  background-color: #5b6eae;
                }

                .updatePanel h2 {
                  color: #fff;
                  font-size: .85em;
                  margin-left: 1.2em;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  overflow: hidden;
                }

                .updatePanel span[action=close] {
                  cursor: pointer;
                  display: flex;
                  justify-content: center;
                      align-items: center;
                  width: 77px;
                  height: 24px;
                  white-space: nowrap;
                  margin-right: 1.2em;
                  margin-left: auto;
                  border-radius: 3px;
                  border: 1px solid #fff;
                  text-align: center;
                  font-size: .85em;
                  color: #fff;
                }
                .updatePanel span[action=close]:hover {
                  color: #7289DA;
                  background-color: #fff;
                }


                .animated {
                  animation-duration: 280ms;
                  animation-fill-mode: both;
                  -webkit-animation-duration: 280ms;
                  -webkit-animation-fill-mode: both;
                }

                .fadeInUp {
                  opacity: 0;
                  animation-name: fadeInUp;
                  -webkit-animation-name: fadeInUp;
                }
                .fadeOutDown {
                  opacity: 1;
                  animation-name: fadeOutDown;
                  -webkit-animation-name: fadeOutDown;
                }

                @keyframes fadeInUp {
                  from {
                    transform: translate3d(0,-6px,0)
                  }

                  to {
                    transform: translate3d(0,-16px,0);
                    opacity: 1
                  }
                }
                @-webkit-keyframes fadeInUp {
                  from {
                    transform: translate3d(0,-6px,0)
                  }

                  to {
                    transform: translate3d(0,-16px,0);
                    opacity: 1
                  }
                }
                @keyframes fadeOutDown {
                  from {
                    transform: translate3d(0,-16px,0);
                  }

                  to {
                    transform: translate3d(0,-6px,0);
                    opacity: 0;
                  }
                }
                @-webkit-keyframes fadeOutDown {
                  from {
                    transform: translate3d(0,-16px,0);
                  }

                  to {
                    transform: translate3d(0,-6px,0);
                    opacity: 0;
                  }
                }
            </style>
        `;
    }


    //--------------------------------------------------------------------


    /*
    * Checks GitHub for a newer version of the script
    */
    checkForUpdate()
    {
        //  Skip checking if user has previously chosen to ignore the update
        if (!this.script.version.ignoreUpdate)
        {
            this.log("Checking for updates...");

            //  Get latest script from GitHub
            $.ajax({
                type: 'GET',
                url:  this.script.link.source
            })
            .then((res) =>
            {
                //  Extract latest version from script
                let latest = res.match(/(?<=current: \').+?(?=\',)/);
                latest = latest === null ? '' : latest[0];

                //  Update global var with latest version
                this.script.version.latest = latest;

                //  Make script versions a number (remove '.')
                let currentVersion = this.script.version.current.replace(/\./g, '');
                let latestVersion  = latest.replace(/\./g, '');

                //  Compare current and latest version
                if (currentVersion < latestVersion)
                {
                    //  Update is available
                    this.script.version.update = true;
                    this.log(`An update is available! [${currentVersion} => ${latestVersion}]`);
                }
            })
            .fail((res) =>
            {
                this.log(`Error checking for updates`, 'error');
            });
        }
    }


    //--------------------------------------------------------------------
    //--------------------------------------------------------------------


    getName()
    {
        return 'Encryption';
    }

    getAuthor()
    {
        return 'hmerritt';
    }

    getVersion()
    {
        return this.script.version.current;
    }

    getDescription()
    {
        return 'Message encryption using AES-256';
    }
};
