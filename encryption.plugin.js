//META{"name":"encryption"}*//
class encryption {


    /*
    * Define global variables
    */
    constructor()
    {
        //  Script version
        this.version = '2.0.0';

        //  Define plugin name
        this.pluginName = 'encryptionPlugin';

        //  Load user data from local storage
        this.userData = localStorage[this.pluginName] ? JSON.parse(localStorage[this.pluginName]) : {};
    }


    /*
    * Runs on plugin load (before start)
    */
    load()
    {
        //  TODO: Check for script updates on github
        //        -> load version file
        //        -> compare latest version with current version
    }


    /*
    * Runs once plugin has laoded
    */
    start()
    {
        //  TODO: Inject required scripts into head
        //        -> crypto lib
        //        -> hash   lib
        this.injectScript('cryptojs', 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.min.js');

        //  TODO: Inject lock icon into messages page
        //  TODO:
    }


    /*
    * Runs when plugin has been stopped
    */
    stop()
    {
        //  TODO: Unload injected scripts + html
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
    * Inject a script into the page
    * @param string name
    * @param string url
    */
    injectScript(name, url)
    {
        //  Check if script has already been injected
        if (!this.elementExists(`#${this.pluginName}--${name}`))
        {
            //  Inject script into 'head'
            $('head').append(`
                <script
                    id="${this.pluginName}--${name}"
                    src="${url}"
                >
            `);
        }
    }


    //--------------------------------------------------------------------
    //--------------------------------------------------------------------


    getName() {
        return 'Encryption';
    }

    getAuthor() {
        return 'hmerritt';
    }

    getVersion() {
        return this.version;
    }

    getDescription() {
        return 'Experimental encryption using AES-256';
    }
};
