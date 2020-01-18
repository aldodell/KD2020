/** 
 * KicsyDell Application class base.
 * All KD application must inherate from this class.
 * @param kdDesktop is a reference to a KDDesktop class.
 * @param identifier is short name wich is used to call 
 * the application from line command */
class KDApplication extends KDObject {
    constructor(kdDesktop, identifier) {
        super();
        /**
         * Reference to KDDesktop
         * */
        this.desktop = kdDesktop;
        /**
         * Icon URL
         * */
        this.iconURL = "noIcon.jpg";
        /**
         * Descriptive application name
         * */
        this.title = "This is a generic application test";
        /** 
         * short name wich is used to call 
         * the application from line command
         *  */
        this.identifier = identifier == undefined ? "genApp" : identifier;

    }

    /** 
     * Desktop script call run() method in order to
     * make alive the application.
     * This is a entry point.
     * */
    run() {
        alert("Must override run() method on '" + this.identifier + "' application.");
    }
}


class KDTerminal extends KDApplication {
    constructor(kdDesktop) {
        super(kdDesktop, "KDTerminal");
        this.iconURL = "apps/KDTerminal/media/bash.png";
        this.title = "Terminal";
        var mainWindowSize = new KDSize(600, 400);
        this.mainWindow = new KDWindow()
            .publish(kdDesktop)
            .setSize(mainWindowSize)
            .setPosition(KDPosition.centerScreen(mainWindowSize))
            .hide();

        this.mainWindow.body.domObject.style.overflow = "scroll";
        this.newCommandLine(this);
        this.lines = new Array();

    }

    proccessCommand(kdTerminal, text) {

    }

    newOuputLayer(kdTerminal, htmlText) {
        var ouputLayer = new KDLayer().build();
        ouputLayer.position = "relative";
        ouputLayer.width = "inherit";
        ouputLayer.left = "0px";
        ouputLayer.right = "0px";
        ouputLayer.domObject.innerHTML = htmlText;

    }

    newCommandLine(kdTerminal) {
        var commandLineStyle = new KDStyle();
        commandLineStyle.position = "relative";
        commandLineStyle.width = "inherit";
        commandLineStyle.left = "0px";
        commandLineStyle.right = "0px";

        var commandLine = new KDTextBox()
            .publish(this.mainWindow.body);

        commandLine.domObject.addEventListener("keypress", function (e) {
            if (e.code == "Enter") {
                if (commandLine.getText() == "") {
                    kdTerminal.newCommandLine(kdTerminal);
                } else {
                    proccessCommand(kdTerminal, commandLine.getText());
                }

            } else {
                alert(e.key);
            }
        });




        commandLine.domObject.focus();
        commandLineStyle.apply(commandLine);
    }

    run() {
        this.mainWindow.show();
    }

    onSetSizeEvent(kdSize) {



    }


}