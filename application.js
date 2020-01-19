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
        this.lineStyle = new KDStyle()
            .add("position", "relative")
            .add("width", this.mainWindow.body.size.offset(-10, 0).widthpx())
            .add("backgroundColor", "transparent")
            .add("borderStyle", "none")
            .add("padding", "4px")
            .add("boxShadow", "")
            .add("fontFamily", "'Lucida Console', Monaco, monospace")
            .add("fontSize", "14");
        this.currentCommandLine = undefined;
        this.newCommandLine(this);
    }

    proccessCommand(kdTerminal, text) {

        if (text == "?") {
            kdTerminal.newOuputLayer(kdTerminal, "Help:");
            return true;
        }

        var i;
        for (i = 0; i < kdTerminal.desktop.applicationsIntances.length; i++) {
            var app = kdTerminal.desktop.applicationsIntances[i];
            if (app.identifier == text) {
                app.run();
                this.newCommandLine(kdTerminal);
                return true;
            }
        }
        kdTerminal.newOuputLayer(kdTerminal, text + " is not a valid command.");
    }

    newOuputLayer(kdTerminal, htmlText) {
        var ouputLayer = new KDLayer().build();
        ouputLayer.publish(kdTerminal.mainWindow.body);
        ouputLayer.domObject.innerHTML = htmlText;
        kdTerminal.lineStyle.apply(ouputLayer);
        kdTerminal.newCommandLine(kdTerminal);
    }

    newCommandLine(kdTerminal) {
        var commandLine = new KDTextBox()
            .publish(this.mainWindow.body);

        commandLine.domObject.addEventListener("keypress", function (e) {
            if (e.code == "Enter") {
                if (commandLine.getText() == "") {
                    kdTerminal.newCommandLine(kdTerminal);
                } else {
                    kdTerminal.proccessCommand(kdTerminal, commandLine.getText());
                }
            }
        });

        commandLine.domObject.addEventListener("keydown", function (e) {

            /* Autocompletion pressing TAB */
            if (e.code == "Tab") {
                e.preventDefault();
                var i, k, l;
                var t = commandLine.getText();
                if (t.length == 0) {
                    this.focus();
                    return false;
                }
                for (i = 0; i < kdTerminal.desktop.applicationsIntances.length; i++) {
                    var app = kdTerminal.desktop.applicationsIntances[i];
                    k = app.identifier.indexOf(t);
                    l = t.length;
                    if (k == 0) {
                        commandLine.appendText(app.identifier.substr(l));
                        return true;
                    }
                }

            }
        });

        kdTerminal.lineStyle.apply(commandLine);
        commandLine.domObject.focus();
        kdTerminal.currentCommandLine = commandLine;
    }
    run() {
        this.mainWindow.show();
        this.currentCommandLine.domObject.focus();
    }
}