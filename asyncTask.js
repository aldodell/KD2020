/**
 * Manage async task
 * @param scriptGeneratorURL Pointer to a script (ex. a PHP script) wich
 * change the javascript  
 * */
class KDAsyncTask extends KDObject {

    constructor() {
        super();

        /** URL of script wich will be execute */
        this.url = "defaultTask.js";
        this.timerHandler = undefined;
        this.timeBetweenCalls = 3000;
        this.script = new KDScript().build().publish();
        this.scriptGeneratorURL = "asyncTask.php";

        //Internal form to send data to server
        this.sender = new KDSender(this.scriptGeneratorURL).build().publish();

        /** Called when script is loaded */
        this.callback = function () { };
    }


    loop(obj) {
        obj.script.load(obj.url);
    }

    /** Send code string to URL file wich will execute */
    pushCode(command) {
        this.sender
            .set("command", "push")
            .set("parameters", command)
            .set("scriptURL", this.url)
            .send();
    }

    start() {
        this.timerHandler = window.setInterval(this.loop, this.timeBetweenCalls, this);
        obj.script.domObject.addEventListener("load", obj.callback);

    }

    stop() {
        window.clearInterval(this.timerHandler);
        obj.script.domObject.removeEventListener("load", obj.callback);

    }
}