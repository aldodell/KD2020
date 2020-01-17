
/**
 * Desktop manager classes
 * */
class KDDesktop extends KDVisualComponent {
    constructor() {
        super();
        this.applications = new Array();
        //this.requestFullScreen();

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

    addApplication(kdApplication) {
        this.applications.push(kdApplication);
    }


}

//Initial implementation
//var kdDesktop = new KDDesktop();


