
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
        this.windowZIndex = 0;
        this.windows = new Array();

    }

    build() {
        super.build();
        return this;
    }

    publish(kdComponent) {
        super.publish(kdComponent);
        return this;
    }


    /** Pass class type, not a instance of class*/
    addApplicationClass(kdApplicationClass) {
        this.applicationsClasses.push(kdApplicationClass);
        return this.applicationsClasses.length - 1;
    }

    getApplicationInstance(identifier) {


        return undefined;
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

    /** 
     * Broadcast a local message for all or a particular application.
     * Do not use this method to send messages for other networks nodes.
     * Each message has a detinationIdentifier property. If this property
     * is set to "*" all applications will receive the message. In other
     * case only the application with proper identifier will receive it.
     * Each application must override processMessage method in order to 
     * handle the message
     * */
    broadcastLocalMessage(kdMessage) {
        var i;
        for (i = 0; i < this.applicationsInstances.length; i++) {
            var app = this.applicationsInstances[i];
            if (kdMessage.destinationIdentifier = "*" || kdMessage.destinationIdentifier == app.identifier) {
                app.processMesage(kdMessage)
            }
        }

    }

}