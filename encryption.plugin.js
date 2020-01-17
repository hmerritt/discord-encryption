//META{"name":"encryption"}*//
class encryption {


    /*
    * Define global variables
    */
    constructor()
    {
        //  Define plugin name
        this.pluginName = "encryptionPlugin";

        //  Load user data from local storage
        this.userData = localStorage[this.pluginName] ? JSON.parse(localStorage[this.pluginName]) : {};
    }


    //--------------------------------------------------------------------


    /*
    * Runs on plugin load (before start)
    */
    load()
    {
        //  TODO: inject required scripts into head
        //        -> crypto lib
        //        -> hash   lib
    }


    //--------------------------------------------------------------------


    /*
    * Runs once plugin has laoded
    */
    start()
    {
        console.log("userData:", this.userData);

        this.userData = {"new": 1}
    }


    //--------------------------------------------------------------------


    /*
    * Runs when plugin has been stopped
    */
    stop()
    {

    }


    //--------------------------------------------------------------------


    getName() {
        return 'Encryption';
    }

    getAuthor() {
        return 'hmerritt';
    }

    getVersion() {
        return '2.0.0';
    }

    getDescription() {
        return 'Experimental encryption using AES-256';
    }
};
