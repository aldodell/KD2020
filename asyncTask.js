/**
 * Manage async task
 * @param scriptGeneratorURL Pointer to a script (ex. a PHP script) wich
 * change the javascript  
 * */
class KDAsyncTask extends KDObject {

    constructor() {
        super();

        /** URL of script wich will be execute */
        this.scriptExecutorURL = "defaultTask.js";
        this.timerHandler = undefined;
        this.timeBetweenCalls = 3000;
        this.script = new KDScript().build().publish();
        this.scriptGeneratorURL = "asyncTask.php";

        //Internal form to send data to server
        this.toServer = new KDSender(this.scriptGeneratorURL).build().publish();

        /** Called when script is loaded */
        this.callback = function () { };
    }

    setScriptExecutor(url) {
        this.scriptExecutorURL = url;
        return this;
    }

    setScriptGenerator(url) {
        this.scriptGeneratorURL = url;
        return this;
    }

    /** Send code string to URL file wich will execute */
    send(code) {
        this.toServer
            .set("command", "send")
            .set("parameters", code)
            .set("scriptURL", this.scriptExecutorURL)
            .send();
        return this;
    }

    loop(obj) {

        var old = document.getElementById(obj.script.getId());

        if (old) {
            console.log(old);
            document.body.removeChild(old);
            document.body.appendChild(obj.script.domObject);
            obj.script.domObject.addEventListener("load", obj.callback);
        }
        obj.script.load(obj.scriptExecutorURL);

    }

    start() {
        this.timerHandler = window.setInterval(this.loop, this.timeBetweenCalls, this);

    }

    stop() {
        window.clearInterval(this.timerHandler);

    }
}