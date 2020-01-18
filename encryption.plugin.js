//META{ "name":"encryption", "website":"https://github.com/hmerritt/discord-encryption" }*//
class encryption {


    /*
    * Define global variables
    */
    constructor()
    {
        //  Script version
        this.version = {
            current: '2.0.0',
            latest:  '',
            update:  false,
            ignoreUpdate: false
        };

        //  Define plugin name
        this.pluginName = 'encryptionPlugin';

        //  Load user data from local storage
        this.userData = localStorage[this.pluginName] ? JSON.parse(localStorage[this.pluginName]) : {};

        //  Stores component data
        this.components = {};
    }


    /*
    * Runs once on plugin load (before start)
    */
    load()
    {
        this.log("Script has loaded");

        //  Check for new version
        this.checkForUpdate();

        //  Initialize DOM components
        this.initializeComponents();
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
    * @param string msg
    * @param string type
    */
    log(msg, type="")
    {
        const prefix = `[${this.pluginName}]`;
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
        if (!this.elementExists(`[${this.pluginName}=${name}]`))
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
            <script ${this.pluginName}="${name}" src="${url}">
        `); //
    }


    /*
    * Creates global components
    */
    initializeComponents()
    {

        /*
        * CSS
        */
        this.components.styles = `
            <style ${this.pluginName}="styles">
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
        if (!this.version.ignoreUpdate)
        {
            this.log("Checking for updates...");

            //  Get latest script from GitHub
            $.ajax({
                type: 'GET',
                url:  'https://raw.githubusercontent.com/hmerritt/discord-encryption/master/encryption.plugin.js'
            })
            .then((res) =>
            {
                //  Extract latest version from script
                let latest = res.match(/(?<=current: \').+?(?=\',)/);
                latest = latest === null ? '' : latest[0];

                //  Update global var with latest version
                this.version.latest = latest;

                //  Get script version in number form (remove '.')
                let currentVersion = this.version.current.replace(/\./g, '');
                let latestVersion  = latest.replace(/\./g, '');

                //  Compare current and latest version
                if (currentVersion < latestVersion)
                {
                    //  Update is available
                    this.version.update = true;
                    this.log(`An update is available! [${currentVersion} => ${latestVersion}]`);
                }
            })
            .fail((res) => {
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
        return this.version.current;
    }

    getDescription()
    {
        return 'Message encryption using AES-256';
    }
};
