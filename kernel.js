/**
 * Kernel of KicsyDell Api 2020 release
 * */


/** KicsyDell Index object */
var KD_OBJECTS_INDEX = 0;


/** Base object */
class KDObject {
    constructor() {
        this.index = KD_OBJECTS_INDEX++;
    }

    getId() {
        return "kd" + this.index;
    }

    getNameOfInstance() {
        for (name in window) {
            if (window[name] == this) return name;
        }
    }
}


/** Wrap info about current user */
class KDUser extends KDObject {
    constructor(userName) {
        super();
        this.name = undefined ? "guest" : userName;
        this.securityLevel = 0;
        this.passwordHash = 0;

    }
}


/** Enviroment KERNEL class */
class KDKernel extends KDObject {

    static isTouchAvailable() {
        if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
            return true;
        }
        return false;
    }


    createUser(userName) {
        var user = new KDUser(userName);
        var sender = new KDSender(this.CREATE_USER_URL)
            .build()
            .publish()
            .set("name", userName)
            .set("securityLevel", user.securityLevel)
            .send();
        return this;
    }

    loadUser(userName, desktop) {
        var user = new KDUser();
        user.name = userName;
        user.securityLevel = 0;

        var sender = new KDSender(this.LOAD_USER_URL);
        sender
            .build()
            .publish()
            .set("obj", this.getNameOfInstance())
            .set("name", userName)
            .set("senderID", sender.getId())
            .send();


        return this;
    }

    getUserPath(userName) {
        return "users/" + userName;
    }

    constructor() {
        super();
        this.CREATE_USER_URL = 'kd-kernel-create-user.php';
        this.LOAD_USER_URL = 'kd-kernel-load-user.php';
        this.currentUser = new KDUser("guest");
        this.createUser(this.currentUser.name);
    }
}



/** Wrap messages to share between apps 
 * @param sourceIdentifier 
*/
class KDMessage extends KDObject {
    constructor(sourceIdentifier, destinationIdentifier) {
        super();
        this.sourceIdentifier = sourceIdentifier;
        this.destinationIdentifier = destinationIdentifier;
        this.values = new Object();
        //All new messages has zero index.
        //Replicator may change this 
        this.index = 0;

    }
    setValue(key, value) {
        this.values[key] = value;
    }

    getValue(key) {
        return this.values[key];
    }

    getId() {
        return "kdm" + this.index;
    }

    importJSON(json) {
        this.values = json.values;
        this.destinationIdentifier = json.destinationIdentifier;
        this.sourceIdentifier = json.sourceIdentifier;
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


    /** Increment (or decrement) size by (dx,dy)*/
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


/** Wrap position for components*/
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
