/** Helper class to parse arguments */
class KDArgumentsParser extends KDObject {
    constructor(text) {
        super();
        this.command = "";
        this.arguments = new Array();
        var re1 = new RegExp("\\s+(?=(?:[^\\\"]*\\\"[^\\\"]*\\\")*[^\\\"]*$)");
        var tokens = text.split(re1);
        this.command = tokens[0];
        var i = 1;
        for (i = 1; i < tokens.length; i++) {
            this.arguments.push(tokens[i]);
        }
    }
}



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

        /**
         * Save a pointer to application main window
         * If this pointer is undefined means that
         * this app is a console command
         * */
        this.mainWindow = undefined;
    }

    /** 
     * Desktop script call run(arguments) method in order to
     * make alive the application.
     * This is a entry point.
     * */
    run(args) {
        alert("Must override run() method on '" + this.identifier + "' application.");
    }
}


class KDTerminal extends KDApplication {
    constructor(kdDesktop) {
        super(kdDesktop, "KDTerminal");
        this.iconURL = "apps/KDTerminal/media/bash.png";
        this.title = "KDTerminal";
        var mainWindowSize = new KDSize(600, 400);
        this.mainWindow = new KDWindow()
            .publish(kdDesktop)
            .setSize(mainWindowSize)
            .setPosition(KDPosition.centerScreen(mainWindowSize))
            .setTitle(this.title)
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
        this._indexCommandLine = 0;
    }

    proccessCommand(kdTerminal, text) {

        if (text == "?") {
            kdTerminal.newOuputLayer(kdTerminal, "Help:");
            return true;
        }


        /* This part splits text by '|'. So get first argument(command) and rests arguments
        First argument or command is evalute to determine wich application will run
        and pass rest of arguments like an string
        */
        var i, j;
        var resultText = "";
        var sentences = text.split("|");
        var isValid = false;
        for (j = 0; j < sentences.length; j++) {
            var parser = new KDArgumentsParser(sentences[j]);
            for (i = 0; i < kdTerminal.desktop.applicationsIntances.length; i++) {
                var app = kdTerminal.desktop.applicationsIntances[i];
                if (app.identifier == parser.command) {
                    var args = parser.arguments;
                    args.push(resultText);
                    resultText = app.run(args);
                    kdTerminal.newOuputLayer(kdTerminal, resultText);
                    //this.newCommandLine(kdTerminal);
                    isValid = true;
                    break;
                }
            }
        }
        if (!isValid) { kdTerminal.newOuputLayer(kdTerminal, text + " is not a valid command."); }
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

            } else if (e.code == "ArrowUp") {
                var nodes = kdTerminal.mainWindow.body.domObject.getElementsByTagName("input");
                kdTerminal._indexCommandLine--;
                if (kdTerminal._indexCommandLine > -1) {
                    commandLine.setText(nodes[kdTerminal._indexCommandLine].value);
                }
            } else if (e.code == "ArrowDown") {
                var nodes = kdTerminal.mainWindow.body.domObject.getElementsByTagName("input");

                if (kdTerminal._indexCommandLine < nodes.length) {
                    kdTerminal._indexCommandLine++;
                    commandLine.setText(nodes[kdTerminal._indexCommandLine].value);
                }   
            }
        });

        kdTerminal.lineStyle.apply(commandLine);
        commandLine.domObject.focus();
        kdTerminal.currentCommandLine = commandLine;
        kdTerminal._indexCommandLine = kdTerminal.mainWindow.body.domObject.getElementsByTagName("input").length;

    }
    run() {
        this.mainWindow.show();
        this.currentCommandLine.domObject.focus();
    }
}


class KDTerminalAlert extends KDApplication {
    constructor(kdDesktop) {
        super(kdDesktop, "alert");
        this.mainWindow = undefined;
    }
    run(args) {
        alert(args.join(" "));
        return args;
    }
}


class KDTerminalClock extends KDApplication {
    constructor(kdDesktop) {
        super(kdDesktop, "clock");
        this.mainWindow = undefined;
    }
    run() {
        return new Date();
    }

}

