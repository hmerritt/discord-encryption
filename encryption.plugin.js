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
    * Runs once on plugin load (before start)
    */
    load()
    {
        this.log("Script has loaded");

        //  TODO: Check for script updates on github
        //        -> load version file
        //        -> compare latest version with current version
        this.log("Checking for updates...");
    }


    /*
    * Runs each time plugin starts (after load on initial start)
    */
    start()
    {
        //  Import the crypto-js lib
        this.injectScript('cryptojs', 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.min.js');

        //  TODO: Inject lock icon into messages page
        //  TODO:

        //  TODO: Build out userData object
    }


    /*
    * Runs when plugin has been stopped
    */
    stop()
    {
        //  Remove all elements that have been injected
        this.removeElements(`[${this.pluginName}]`);
    }


    /*
    * Creates a log in the console
    */
    log(msg, type="")
    {
        const prefix = `[${this.pluginName}]`;
        switch(type)
        {
            case "error":
                console.error(prefix, msg);
            case "warning":
                console.warn(prefix, msg);
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
                    ${this.pluginName}=""
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
