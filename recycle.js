    /** Use to send a message to a php script saving the message
     * on a file. So, each desktop working can open this file.
     * This method make a GET request on a server by it URL.
     * The GET request has this structure:
     *      url?d=nameOfInstance&m=kdMessage
     * On this case, kdMessage is serialize using JSON.
     * 
     * */
    sendRemoteMessage(kdMessage) {
        var json = JSON.stringify(kdMessage);
        //Send desktop instance name + message
        var uri = this.messageReplicatorURL +
            "?d=" +
            encodeURIComponent(this.getNameOfInstance()) +
            "&m=" +
            encodeURIComponent(json);

        console.log(uri);
        this.remoteMessagesProcessor
            .load(uri);
    }

    /**
     * This method is called by desktop on a inner loop. 
     * It will load a script with all messages that has been sended by applications and desktop
     * */
    remoteMessagesLoop(theDesktop) {
        console.log("Entering to remoteMessagesLoop");
        try {
            theDesktop.remoteMessagesProcessor.load(theDesktop.remoteMessageQueueURL);
        } catch (ex) {
            console.log("ERROR:" + ex);
        }
    }

    /** Start a loop wich load a script having a message queue */
    startRemoteMessagesHandler() {
        var theDesktop = this;
        //Initial message
        console.log(this.messageResetURL);
        this.remoteMessagesProcessor.load(this.messageResetURL);
        this.remoteMessagesTimer = window.setInterval(function () { theDesktop.remoteMessagesLoop(theDesktop); }, this.remoteMessagesProcessorTime);
    }

    stopRemoteMessagesHandler() {
        window.clearInterval(this.remoteMessagesTimer);
    }

    /**
     * Broadcast a message to all availables apps 
     * associates with this desktop.
     * This implementation send messages locally. This means that other users
     * sharing the application on other network node can't receive this messages.
     * 
     * */
    sendMessage(kdMessage) {
        if (kdMessage.index > this.lastMessageIndex) {
            this.lastMessageIndex = kdMessage.index;
            var i;
            for (i = 0; i < this.applicationsInstances.length; i++) {
                var app = this.applicationsInstances[i];
                if (kdMessage.destinationIdentifier == app.identifier) {
                    app.processMessage(kdMessage);
                } else if (kdMessage.destinationIdentifier == "" || kdMessage.destinationIdentifier == "*") {
                    app.processMessage(kdMessage);
                }
            }
        }
        return kdMessage;
    }



    this.remoteMessagesProcessor = new KDScript();
    this.remoteMessagesProcessorTime = 1000;

    this.messageReplicatorURL = "kd-messages-replicator.php";
    this.messageResetURL = "kd-messages-reset.php";
    this.remoteMessageQueueURL = "kd-messages-queue.js";

    this.remoteMessagesTimer = 0;
    this.lastMessageIndex = -1;



    build() {
        super.build();
        this.form.url = this.url;
        this.form.build();
        this.domObject.setAttribute("name", this.getId());
        this.form.domObject.setAttribute("name", this.getId() + "_form");
        return this;
    }

    publish(kdComponent) {

        if (!this.domObject) this.build();

        if (kdComponent == undefined) {
            var head = document.getElementsByTagName("head")[0];
            head.appendChild(this.domObject);
        } else {
            super.publish(kdComponent);
        }

        var iframeDoc = this.domObject.contentDocument || this.domObject.contentWindow.document;
        var iFrameBody = iframeDoc.getElementsByTagName("body")[0];
        iFrameBody.appendChild(this.form.domObject);
        return this;
    }

    setUrl(url) {
        this.url = url;
        this.form.url = url;
        if (this.form.domObject) {
            this.form.domObject.setAttribute("action", url);
        }
        return this;
    }

    set(name, value) {
        if (!this.domObject) {
            this.build().publish();
        }
        var hidden = new KDHidden().build().publish(this.form);
        hidden.setName(name).setValue(value);

        return this;
    }

    removeSender(kdSender) {
        var iframe = window.parent.document.getElementById(kdSender.getId());
        iframe.parentNode.removeChild(iframe);
    }

    send() {
        if (this.domObject) {
            this.form.submit();
        }
        if (this.destroyTime > 0) {
            var sender = this;
            window.setTimeout(sender.removeSender, sender.destroyTime, sender);
        }
        return this;
    }

    constructor(url) {
        super();
        this.htmlName = "iframe";
        this.url = url;
        this.form = new KDForm();
        this.form.url = url;
        this.method = "post";
        this.style.visibility = "hidden";
        /** Time to dettach iFrame from DOM Hierarchy. Zero for do not dettach it */
        this.destroyTime = 60000;
    }