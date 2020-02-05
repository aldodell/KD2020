/**
 * Manage async task
 * */
class KDAsyncTask extends KDObject {

    constructor() {
        super();

        /** URL of script wich will be execute */
        this.url = "defaultTask.js";
        this.timerHandler = undefined;
        this.timeBetweenCalls = 3000;
        this.script = new KDScript().build().publish();

        //Internal form to send data to server
        this.sender = new KDSender().build.publish();

        /** Called when script is loaded */
        this.callback = function () { };
    }


    loop(obj) {
        obj.script.domObject.addEventListener("load", obj.callback);
        obj.script.load(obj.url);
        obj.script.domObject.removeEventListener("load", obj.callback);
    }

    /** Send code string to URL file wich will execute */
    pushCode(command) {
        this.sender.send("command", command);
    }

    start() {
        this.timerHandler = window.setInterval(this.loop, this.timeBetweenCalls, this);
    }

    stop() {
        window.clearInterval(this.timerHandler);
    }
}