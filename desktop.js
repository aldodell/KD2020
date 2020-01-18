
/**
 * Desktop manager classes
 * */
class KDDesktop extends KDVisualComponent {
    constructor() {
        super();
        this.applicationsClasses = new Array();
        //this.requestFullScreen();
        this.publish();

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
    }

    run() {

        //Create icons app
        var appLayerHeight = 64;
        var appLayerWidth = 64;
        var appLayerSize = new KDSize(appLayerWidth, appLayerHeight);
        var appIconSize = appLayerSize.offset(-8, -16);
        var appIconPosition = new KDPosition(0, 0).centerVertically(appLayerSize, appIconSize);
        var appLayerPosition = new KDPosition(0, 0);
        var appLayerLabelPosition = new KDPosition(0, appLayerHeight);
        var appIconStyle = new KDStyle();
        var apps = new Array();

        appIconStyle.backgroundColor = "transparent";
        appIconStyle.border = "";


        var i = 0;
        for (i = 0; i < this.applicationsClasses.length; i++) {
            apps[i] = new this.applicationsClasses[i](this);

            var appLayer = new KDLayer().build()
                .setSize(appLayerSize)
                .setPosition(appLayerPosition.move(appLayerWidth, appLayerHeight + (i * appLayerHeight)))
                .setDraggable(true)
                .publish(this);

            var appIcon = new KDImage().build()
                .setSource(apps[i].iconURL)
                .setPosition(appIconPosition)
                .setSize(appIconSize)
                .publish(appLayer);

            var appLabel = new KDLayer().build()
                .showCenterText(apps[i].title)
                .setPosition(appLayerLabelPosition)
                .publish(appLayer);

            appIconStyle.apply(appLayer);
            appIconStyle.apply(appLabel);
            appIconStyle.apply(appIcon);
            kdIconFont.apply(appLabel);

            appLayer.domObject.app = apps[i];
            appLayer.domObject.ondblclick = function () { this.app.run() };
            appIcon.domObject.ondragstart = function () { return false; };

        }
    }

}



