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
}


class KDKernel {
    static isTouchAvailable() {
        if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
            return true;
        }
        return false;
    }
    constructor() { }
}

/** Wrap messages to share between apps 
 * @param sourceIdentifier 
*/
class KDMessage extends KDObject {
    constructor(sourceIdentifier, destinationIdentifier) {
        this.sourceIdentifier = sourceIdentifier;
        this.destinationIdentifier = destinationIdentifier;
        this.values = new Array();
    }
    appendValue(key, value) {
        this.values[this.values.length] = { "key": key, "value": value };
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
