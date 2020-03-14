
/**
 * Desktop manager classes
 * */
class KDDesktop extends KDVisualComponent {
    constructor(kdKernel) {
        super();

        //Circular reference between desktop and kernel
        kdKernel.desktop = this;
        this.kernel = kdKernel
        
        this.applicationsClasses = new Array();
        this.applicationsInstances = new Array();
        this.remoteMessagesProcessor = new KDScript();
        this.remoteMessagesProcessorTime = 1000;

        this.messageReplicatorURL = "kd-messages-replicator.php";
        this.messageResetURL = "kd-messages-reset.php";
        this.remoteMessageQueueURL = "kd-messages-queue.js";

        this.remoteMessagesTimer = 0;
        this.lastMessageIndex = -1;

        this.windowZIndex = 0;
        this.windows = new Array();

    }

    build() {
        super.build();
        this.remoteMessagesProcessor.build();
        return this;
    }

    publish(kdComponent) {
        this.remoteMessagesProcessor.publish(kdComponent);
        super.publish(kdComponent);
        return this;
    }

    /* When the openFullscreen() function is executed, open the video in fullscreen.
    Note that we must include prefixes for different browsers, as they don't support the requestFullscreen method yet */
    requestFullScreen() {
        var elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
        }
    }

    /** Pass class type, not a instance of class*/
    addApplicationClass(kdApplicationClass) {
        this.applicationsClasses.push(kdApplicationClass);
        return this.applicationsClasses.length - 1;
    }

    getApplicationInstance(identifier) {
        var i;
        for (i = 0; i < this.applicationsInstances.length; i++) {
            var app = this.applicationsInstances[i];
            if (identifier == app.identifier) {
                return app;
            }
        }
        return undefined;
    }

    /** Use to send a message to a php script saving the message
     * on a file. So, each desktop working can open this file
     * */
    sendRemoteMessage(kdMessage) {
        var json = JSON.stringify(kdMessage);
        //Send desktop instance name + message zz2
        var uri = this.messageReplicatorURL +
            "?d=" +
            encodeURIComponent(this.getNameOfInstance()) +
            "&m=" +
            encodeURIComponent(json);

        console.log(uri);
        this.remoteMessagesProcessor
            .load(uri);
    }

    remoteMessagesLoop(theDesktop) {
        console.log("Entering to remoteMessagesLoop");
        try {
            theDesktop.remoteMessagesProcessor.load(theDesktop.remoteMessageQueueURL);
        } catch (ex) {
            console.log("ERROR:" + ex);
        }
    }

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
     *  Broadcast a message to all availables apps 
     * associates with this desktop
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

    run() {

        //Create icons app
        var appLayerHeight = 64;
        var appLayerWidth = 64;
        var appLayerSize = new KDSize(appLayerWidth, appLayerHeight);
        var appIconSize = appLayerSize.offset(-appLayerWidth / 8, -appLayerHeight / 4);
        var appIconPosition = new KDPosition(0, 0).centerVertically(appLayerSize, appIconSize);
        var appLayerPosition = new KDPosition(0, 0);
        var appLayerLabelPosition = new KDPosition(0, appLayerHeight);
        var appIconStyle = new KDStyle();

        appIconStyle.backgroundColor = "transparent";
        appIconStyle.border = "";

        var i = 0;
        var j = 0;
        for (i = 0; i < this.applicationsClasses.length; i++) {
            this.applicationsInstances[i] = new this.applicationsClasses[i](this);

            if (this.applicationsInstances[i].mainWindow != undefined) {
                var appLayer = new KDLayer().build()
                    .setSize(appLayerSize)
                    .setPosition(appLayerPosition.move(0, 2 * appLayerHeight))
                    .setDraggable(true)
                    .publish(this);
                j++;

                var appIcon = new KDImage().build()
                    .setSource(this.applicationsInstances[i].iconURL)
                    .setPosition(appIconPosition)
                    .setSize(appIconSize)
                    .publish(appLayer);

                var appLabel = new KDLayer().build()
                    .showCenterText(this.applicationsInstances[i].title)
                    .setPosition(appLayerLabelPosition)
                    .publish(appLayer);

                appIconStyle.apply(appLayer);
                appIconStyle.apply(appLabel);
                appIconStyle.apply(appIcon);
                kdIconFont.apply(appLabel);

                appLayer.domObject.app = this.applicationsInstances[i];
                appLayer.domObject.ondblclick = function () { this.app.run() };
                appIcon.domObject.ondragstart = function () { return false; };

                //Double touch
                if (KDKernel.isTouchAvailable()) {
                    appLayer.domObject.lastTap = 0;
                    appLayer.domObject.addEventListener("touchend", function (touchEvent) {
                        var currentTime = new Date().getTime();
                        var tapLength = currentTime - this.lastTap;
                        if (tapLength < 500 && tapLength > 0) {
                            touchEvent.preventDefault();
                            this.app.run();
                        }
                        this.lastTap = currentTime;
                    });
                }
            }

        }
    }

}