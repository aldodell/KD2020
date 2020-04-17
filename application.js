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

    /** Used to process messaged received from desktop or another app  */
    processMessage(kdMessage) {
        //If recieve a message to change window size
        //{"command" : "changeSize", "width":"100", "height":"100"}
        if (this.mainWindow != undefined) {
            if (kdMessage.values["command"] == "changeSize") {
                this.mainWindow.setSize(new KDSize(kdMessage.values["width"], kdMessage.values["height"]));
            }
        }
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

    proccessCommand(kdTerminal, text) {

        if (text == "?") {
            kdTerminal.newOuputLayer(kdTerminal, "Help:");
            return true;
        }

        if (text == "!") {
            var r = "";
            for (i = 0; i < kdTerminal.desktop.applicationsInstances.length; i++) {
                var app = kdTerminal.desktop.applicationsInstances[i];
                r += app.identifier + " ";
            }
            kdTerminal.newOuputLayer(kdTerminal, "Programs availables:\r\n" + r);
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
            for (i = 0; i < kdTerminal.desktop.applicationsInstances.length; i++) {
                var app = kdTerminal.desktop.applicationsInstances[i];
                if (app.identifier == parser.command) {
                    var args = parser.arguments;
                    args.push(resultText);
                    resultText = app.run(args);
                    kdTerminal.newOuputLayer(kdTerminal, resultText);
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

    saveLine(kdTerminal, text) {
        var sender = new KDSender().setUrl(kdTerminal.SAVE_LINE_URL);
        var i = sender.getId();
        sender.set("senderID", i)
            .set("line", text)
            .set("userName", kdTerminal.desktop.kernel.currentUser.name)
            .submit();

    }

    /** Append array line on terminal */
    appendLines(lines) {
        for (line in lines) {
            var h = new KDHidden();
            h.setValue(line);
            h.build().publish(this.mainWindow.body);
        }
    }

    /** Send statement to server to return lines array */
    loadLines() {
        var sender = new KDSender(this.LOAD_LINES_URL)
            .set("terminal", this.getNameOfInstance())
            .set("userName", this.desktop.kernel.currentUser.name)
            .submit()
            .selfDestroy(5000);

    }

    newCommandLine(kdTerminal) {

        var commandLine = new KDTextBox()
            .publish(this.mainWindow.body);


        /*
    commandLine.domObject.addEventListener("keypress", function (e) {
        if (e.code == "Enter" || e.which === 13) {
            if (commandLine.getText() == "") {
                kdTerminal.newCommandLine(kdTerminal);
            } else {
                kdTerminal.proccessCommand(kdTerminal, commandLine.getText());
                kdTerminal.saveLine(kdTerminal, commandLine.getText());
            }
        }

    });
    */

        commandLine.domObject.addEventListener("keydown", function (e) {


            if (e.code == "Enter" || e.which === 13) {
                if (commandLine.getText() == "") {
                    kdTerminal.newCommandLine(kdTerminal);
                } else {
                    kdTerminal.proccessCommand(kdTerminal, commandLine.getText());
                    kdTerminal.saveLine(kdTerminal, commandLine.getText());
                }
            }

            /* Autocompletion pressing TAB */
            if (e.code == "Tab") {
                e.preventDefault();
                var i, k, l;
                var t = commandLine.getText();
                if (t.length == 0) {
                    this.focus();
                    return false;
                }
                for (i = 0; i < kdTerminal.desktop.applicationsInstances.length; i++) {
                    var app = kdTerminal.desktop.applicationsInstances[i];
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

    //overloading run()
    run() {
        this.mainWindow.show();
        this.currentCommandLine.domObject.focus();
    }

    //overloading processMessage
    processMessage(kdMessage) {
        if (kdMessage.sourceIdentifier == "kernel") {
            if (kdMessage.getValue("kernel_user_changed") != undefined) {
                this.loadLines();
            }
        }
    }

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
        this.SAVE_LINE_URL = "kd-terminal-save-line.php";
        this.LOAD_LINES_URL = "kd-terminal-load-lines.php";


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

    processMessage(m) {
        if (m.destinationIdentifier == this.identifier) {
            var t = "Message from: " + m.sourceIdentifier;
            for (const key in m.values) {
                t += "\r\n\t key:" + key + " value:" + m.values[key];
                console.debug(t);
            }
            alert(t);
        }

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


/** Send a KDMessage to apps */
class KDMessageSender extends KDApplication {
    constructor(kdDesktop) {
        super(kdDesktop, "message-sender");
        this.mainWindow = undefined;
    }
    run(args) {
        //Send a message to app with first param as identifier
        var m = new KDMessage(this.identifier, args[0]);
        for (var i = 1; i < args.length; i += 2) {
            m.setValue(args[i], args[i + 1]);
        }
        this.desktop.broadcastRemoteMessage(m);

        return "Message send to " + args[0];
    }
}


class KDCreateUser extends KDApplication {
    constructor(kdDesktop) {
        super(kdDesktop, "create-user");
        this.mainWindow = undefined;
    }
    run(args) {
        var user = args[0];
        if (user == "") {
            user = prompt("Type new user name:");
        }

        this.desktop.kernel.createUser(user);
        return "Done!";
    }
}

class KDLoadUser extends KDApplication {
    constructor(kdDesktop) {
        super(kdDesktop, "load-user");
        this.mainWindow = undefined;
    }
    run(args) {
        var user = args[0];
        if (user == "") {
            user = prompt("Type user name:");
        }
        this.desktop.kernel.loadUser(user);

        return "Done!";
    }
}

class KDShowUser extends KDApplication {
    constructor(kdDesktop) {
        super(kdDesktop, "show-user");
        this.mainWindow = undefined;

    }
    run(args) {
        return this.desktop.kernel.currentUser.name;
    }
}




