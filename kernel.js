/**
 * Kernel of KicsyDell Api 2020 release
 * */


/** KicsyDell Index object */
var KD_OBJECTS_INDEX = 0;

/** Base object */
class KDObject {
    constructor(index) {
        if (index == undefined) {
            this.index = KD_OBJECTS_INDEX++;
        } else {
            this.index = index;
        }
    }

    getId() {
        return "kd" + this.index;
    }

    getNameOfInstance() {
        for (name in window) {
            if (window[name] == this) return name;
        }
    }

    throwException(message) {
        alert(message);
    }

}

/** Wrap messages to share between apps 
 * @param sourceIdentifier 
*/
class KDMessage extends KDObject {
    /**
     * Class to wrap data for sharing between KD applications
     * @param {string} sourceIdentifier 
     * @param {string} destinationIdentifier 
     */
    constructor(sourceIdentifier, destinationIdentifier) {
        super();
        this.sourceIdentifier = sourceIdentifier;
        this.destinationIdentifier = destinationIdentifier;
        this.values = new Object();
        /* 
        All new messages has zero index.
        Replicator may change this.
        */
        this.index = 0;

    }

    /**
     * Put a value associated with a key
     * @param {string} key 
     * @param {*} value 
     */
    addParameter(key, value) {
        this.values[key] = value;
    }

    /**
     * @returns Return a value associated with a key. 
     * @param {string} key 
     */
    getValue(key) {
        return this.values[key];
    }

    /**
     * @returns Returns an identfier for this KD object.
     */
    getId() {
        return "kdm" + this.index;
    }


    /**
     * Import values and other data from JSON string  into this message 
     * @param {*} json 
     * @param {*} index 
     */
    importJSON(json, index) {
        this.index = index == undefined ? json.index : index;
        this.values = json.values;
        this.destinationIdentifier = json.destinationIdentifier;
        this.sourceIdentifier = json.sourceIdentifier;
        return this;
    }

    /**
     * Create a JSON string with this message
     */
    exportJSON() {
        return JSON.stringify(this);
    }
}


/**
 * Wrap info about current user
 */
class KDUser extends KDObject {

    constructor(userName) {
        super();
        this.name = undefined ? "guest" : userName;
        this.securityLevel = 0;
        this.passwordHash = 0;
    }
}


/** 
 * Master KERNEL class 
 * Must be instantiate a KDKernel class before instantiate a KDDesktop class.
 * This class manage user and other low level stuffs.
 *  
*/
class KDKernel extends KDObject {

    static isTouchAvailable() {
        if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
            return true;
        }
        return false;
    }

    createUser(userName) {
        var user = new KDUser(userName);
        var sender = new KDSender(this.CREATE_USER_URL);
        sender
            .addParameter("name", userName)
            .addParameter("securityLevel", user.securityLevel)
            .submit();
        return this;
    }

    loadUser(userName) {
        var user = new KDUser();
        user.name = userName;
        user.securityLevel = 0;

        var sender = new KDSender(this.LOAD_USER_URL);
        sender
            .addParameter("obj", this.getNameOfInstance())
            .addParameter("name", userName)
            .addParameter("senderID", sender.getId())
            .submit();

        /** send messages to all apps about user change */
        var msg = new KDMessage("kernel", "*");
        msg.setValue("kernel_user_changed", userName);
        this.desktop.broadcastLocalMessage(msg);

        return this;
    }

    getUserPath(userName) {
        return "users/" + userName;
    }

    constructor() {
        super();

        /* General use iframe */
        var KERNEL_IFRAME_ID = "KD-KERNEL-IFRAME";
        var iframe = document.getElementById(KERNEL_IFRAME_ID);

        if (iframe == null) {
            iframe = document.createElement("IFRAME");
        }

        iframe.setAttribute("id", KERNEL_IFRAME_ID);
        iframe.setAttribute("name", KERNEL_IFRAME_ID);
        iframe.setAttribute("style", "display:none;");
        document.body.appendChild(iframe);

        /*
        var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        var iframeHtml = iframeDocument.getElementsByTagName("html")[0];
        this.iframeBody = iframeHtml.getElementsByTagName("body")[0];
        */

        this.CREATE_USER_URL = 'kd-kernel-create-user.php';
        this.LOAD_USER_URL = 'kd-kernel-load-user.php';
        this.currentUser = new KDUser("guest");
        this.createUser(this.currentUser.name);
        this.desktop = false;

    }
}

/** Wrap size for components*/
class KDSize {
    constructor(width, height) {
        this.height = height;
        this.width = width;
        this.heightpx = function () { return this.height + "px" };
        this.widthpx = function () { return this.width + "px" };
        this.set = function (width, height) {
            this.width = width;
            this.height = height;
        };
    }


    /**
     * Increment (or decrement) size by (dx,dy)
     * @param {number} dx 
     * @param {number} dy 
     */
    offset(dx, dy) {
        return new KDSize(this.width + dx, this.height + dy);
    }

    setWidth(w) {
        this.width = w;
        return this;
    }

    setHeight(h) {
        this.height = h;
        return this;
    }
}


/** 
 * Wrap position for components
 * */
class KDPosition {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.xpx = function () { return this.x + "px" };
        this.ypx = function () { return this.y + "px" };
        this.set = function (x, y) {
            this.x = x;
            this.y = y;
            return this;
        };

        /** Move component by (dx,dy) */
        this.move = function (dx, dy) {
            this.x += dx;
            this.y += dy;
            return this;
        };

        /**
         * Calculate position to center a component
         * @param kdSize1 is container size
         * @param kdSize2 is component size
         * @returns a KDSize object with coordinates to center the object.
         * */
        this.centerVertically = function (kdSize1, kdSize2) {
            return this.move((kdSize1.width - kdSize2.width) / 2, 0);
        };

        /** 
         * Return a new KDPosition object using dx and dy as offset
         * */
        this.offset = function (dx, dy) {
            return new KDPosition(this.x + dx, this.y + dy);
        }

        this.setX = function (X) {
            this.x = X;
            return this;
        }

        this.setY = function (Y) {
            this.y = Y;
            return this;
        }

    }

    /** Static method
     * @param kdSize is the component size
     * @returns KDPosition object with coordinates to center an object in the screen.
     * */
    static centerScreen(kdSize) {
        var x = (screen.availWidth - kdSize.width) / 2;
        var y = (screen.availHeight - kdSize.height) / 2;
        return new KDPosition(x, y);
    }
}

class KDUnits {
    static px(n) {
        return n + "px";
    }
}