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

    throwException(message) {
        alert(message);
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
        /* 
        All new messages has zero index.
        Replicator may change this.
        */
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


    /** Import values and other data from JSON string  into this message */
    importJSON(json, index) {
        this.index = index == undefined ? json.index : index;
        this.values = json.values;
        this.destinationIdentifier = json.destinationIdentifier;
        this.sourceIdentifier = json.sourceIdentifier;
        return this;
    }

    /** Create a JSON string with this message */
    exportJSON() {
        return JSON.stringify(this);
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
            .set("name", userName)
            .set("securityLevel", user.securityLevel)
            .submit();
        return this;
    }

    loadUser(userName) {
        var user = new KDUser();
        user.name = userName;
        user.securityLevel = 0;

        var sender = new KDSender(this.LOAD_USER_URL);
        sender
            .set("obj", this.getNameOfInstance())
            .set("name", userName)
            .set("senderID", sender.getId())
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
/** Wrap CSS style properties
 * To use it simply add properties like form: .backgroundColor='blue' and then use 'apply' method
 * */
class KDStyle {
    constructor() {
        this.backgroundColor = "BurlyWood";
        this.borderStyle = "solid";
        this.borderWidth = 1;
    }

    /** Apply CSS style properties to kdComponent
     * */
    apply(kdComponent) {
        if (kdComponent.domObject) {
            for (let p in this) {
                let s = "kdComponent.domObject.style." + p + "=\"" + this[p] + "\"";
                eval(s);
            }
        }
        return this;
    }

    /** Copy all styles from other KDStyle object */
    copyFrom(kdStyle) {
        for (let s in kdStyle) {
            this[s] = kdStyle[s];
        }
        return this;
    }

    add(property, value) {
        this[property] = value;
        return this;
    }

}



/**
 * Font styles
 * */
var kdIconFont = new KDStyle();
kdIconFont.fontSize = "10";
kdIconFont.textAlign = "center";

/** Ready to use style that make a surface where all its
 * elements are horizontally centered
 * */
var kdCenterSurfaceStyle = new KDStyle();
kdCenterSurfaceStyle.textAlign = "center";
kdCenterSurfaceStyle.display = "inline-block";

/**
 * Component class base
 * */
class KDComponent extends KDObject {
    constructor() {
        super();
        // HTML tag name
        this.htmlName = "div";
        // HTML type component
        this.htmlType = "";
        //Pointer to DOM representation
        this.domObject = false;
    }

    /**
     *  Build component method.
     * This method build the component and prepare it to show
     * Use then @method publish to merge this component on the DOM hierarchy.
     * @returns itself reference to do chain property handling.
     *  */
    build() {
        this.domObject = document.createElement(this.htmlName);
        this.domObject.setAttribute("id", "kd" + this.index);
        this.domObject.style.position = "absolute";
        if (this.htmlType != "") {
            this.domObject.setAttribute("type", this.htmlType);
        }
        return this;
    }

    /** Publish component on antoher component or
     * in document DOM level if argument is null
     *  @returns itself reference to do chain property handling.

    */
    publish(kdComponent) {

        //If component hasn't been build, so build it.
        if (this.domObject == false) {
            this.build();
        }

        //If argument is null means that
        //the component will be published on document.body DOM level
        var obj = document.body;
        if (kdComponent != null) {
            if (!kdComponent.domObject) {
                if (kdComponent.build) {
                    kdComponent.build();
                }
            }
            obj = kdComponent.domObject;
        }
        obj.appendChild(this.domObject);
        return this;
    }

    /** Add a child component */
    add(kdComponent) {
        if (this.domObject) {
            kdComponent.publish(this);
        }
    }

    /** Remove this element from DOM */
    remove(kdComponent) {
        if (kdComponent.domObject) {
            kdComponent.domObject.parentNode.removeChild(kdComponent.domObject);
        }
    }

    /** Remove this element from DOM until a time */
    selfDestroy(time) {
        window.setTimeout(this.remove, time, this);
    }
}

class KDHeadTag extends KDComponent {
    build() {

        this.domObject = document.getElementsByTagName("head")[0];
        return this;
    }

    publish() {
    }

}
//Instance
var kdHeadTag = new KDHeadTag();


/** Visual components base classes
 * */
class KDVisualComponent extends KDComponent {
    constructor() {
        super();
        this.style = new KDStyle();
        this.draggable = false;
        this.moving = false;
        this.initialPosition = null;
        this.position = new KDPosition(0, 0);
        this.size = new KDSize(100, 20);
        this.style.zIndex = "0";
    }
    /**
     * Set component size. @param size is a KDSize object.
     *  @returns itself reference to do chain property handling.
     * */

    setSize(kdSize) {
        if (this.domObject) {
            this.size = kdSize;
            this.domObject.style.width = kdSize.widthpx();
            this.domObject.style.height = kdSize.heightpx();
        }
        return this;
    }

    getSize() {
        return this.size;
    }

    setAvailableScreenSize() {
        this.setSize(new KDSize(screen.availWidth, screen.availHeight));
    }



    /** Set the actually position of a component
     *  @returns itself reference to do chain property handling.
     */
    setPosition(kdPosition) {
        if (this.domObject) {
            this.position = kdPosition;
            this.domObject.style.left = kdPosition.xpx();
            this.domObject.style.top = kdPosition.ypx();
        }
        return this;
    }

    getPosition() {
        if (this.position) {
            this.position.x = parseInt(this.domObject.style.left);
            this.position.y = parseInt(this.domObject.style.top);
            return this.position;
        }
        return false;
    }

    /**
     *  @returns itself reference to do chain property handling.
     * */
    publish(kdObject) {
        super.publish(kdObject);
        this.style.apply(this);
        return this;
    }


    /** Change visibility property to show the component.
     *  @returns itself reference to do chain property handling.
     * */
    show() {
        if (this.domObject) {
            this.domObject.style.visibility = "visible";
        }
        return this;
    }

    /** Change visibility property to hide the component.
   *  @returns itself reference to do chain property handling.
   * */
    hide() {
        if (this.domObject) {
            this.domObject.style.visibility = "hidden";
        }
        return this;
    }


    /** Make the component grant dragging operation.
      *  @returns itself reference to do chain property handling.
      * */
    setDraggable(booleanValue, objectToBeMoved) {
        this.draggable = booleanValue;
        if (objectToBeMoved == undefined) { objectToBeMoved = this; }
        if (booleanValue) {
            if (this.domObject) {
                var obj = this;

                this.domObject.addEventListener("mousemove", function (event) {
                    if (obj.moving) {
                        event.preventDefault();
                        var dx = event.clientX - obj.initialPosition.x;
                        var dy = event.clientY - obj.initialPosition.y;
                        var p = objectToBeMoved.getPosition();
                        p.move(dx, dy);
                        objectToBeMoved.setPosition(p);
                        obj.initialPosition.set(event.clientX, event.clientY);
                    }
                });
                this.domObject.addEventListener("mousedown", function (event) {
                    obj.initialPosition = new KDPosition(event.clientX, event.clientY);
                    obj.moving = true;
                });
                this.domObject.addEventListener("mouseup", function (event) {
                    obj.moving = false;
                });

                this.domObject.addEventListener("mouseout", function (event) {
                    obj.moving = false;
                });

                //Touch avalible
                if (KDKernel.isTouchAvailable()) {

                    this.domObject.addEventListener("touchmove", function (event) {

                        if (obj.moving) {
                            event.preventDefault();
                            event = event.touches[0];
                            var dx = event.clientX - obj.initialPosition.x;
                            var dy = event.clientY - obj.initialPosition.y;
                            var p = objectToBeMoved.getPosition();
                            p.move(dx, dy);
                            objectToBeMoved.setPosition(p);
                            obj.initialPosition.set(event.clientX, event.clientY);
                        }
                    });
                    this.domObject.addEventListener("touchstart", function (event) {
                        obj.initialPosition = new KDPosition(event.clientX, event.clientY);
                        obj.moving = true;
                    });

                    this.domObject.addEventListener("touchend", function (event) {
                        obj.moving = false;
                    });

                    this.domObject.addEventListener("touchcancel", function (event) {
                        obj.moving = false;
                    });

                    this.domObject.addEventListener("touchleave", function (event) {
                        obj.moving = false;
                    });

                }

            }
        } else {
            this.domObject.removeEventListener("mouseout", this, true);
            this.domObject.removeEventListener("mouseup", this, true);
            this.domObject.removeEventListener("mousedown", this, true);
            this.domObject.removeEventListener("mousemove", this, true);
        }
        return this;
    }

    setName(fieldName) {
        this.domObject.setAttribute("name", fieldName);
        return this;
    }
}



/** Layer or DIV managed 
 * */
class KDLayer extends KDVisualComponent {
    constructor() {
        super();
    }

    /** Show a centered text  on a DIV (layer) 
     *  @returns itself reference to do chain property handling.
  * */
    showCenterText(text) {
        if (this.domObject) {
            this.domObject.style.textAlign = "center";
            this.domObject.style.display = "table-cell";
            this.domObject.style.verticalAlign = "middle";
            this.domObject.innerHTML = text;
        }
        return this;
    }
}



/**
 * Text box
 * */
class KDTextBox extends KDVisualComponent {
    constructor() {
        super();
        this.htmlName = "input";
        this.htmlType = "text";
    }

    setText(text) {
        if (this.domObject) {
            this.domObject.value = text;
        }
        return this;
    }

    appendText(text) {
        if (this.domObject) {
            this.domObject.value += text;
        }
        return this;
    }

    getText() {
        if (this.domObject) {
            return this.domObject.value;
        }
        return "";
    }
}

/** Simple button 
 * */
class KDButton extends KDVisualComponent {
    constructor() {
        super();
        this.htmlName = "input";
        this.htmlType = "button";
        this.style.backgroundColor = "";
        this.style.backgroundColor = "";
        this.style.borderStyle = "";
        this.style.borderWidth = "";
    }

    setText(value) {
        this.domObject.value = value;
        return this;
    }
}





/** Simple image 
 * */
class KDImage extends KDVisualComponent {
    constructor() {
        super();
        this.htmlName = "img";
    }

    setSource(source) {
        if (!this.domObject) {
            this.build();
        }
        this.domObject.src = source;
        return this;
    }
}

/** TextArea HTML wrapper
 * */
class KDTextArea extends KDVisualComponent {
    constructor() {
        super();
        this.htmlName = "textarea";
    }
    setText(text) {
        if (this.domObject) {
            this.domObject.value = text;
        }
        return this;
    }

    appendText(text) {
        if (this.domObject) {
            this.domObject.value += text;
        }
        return this;
    }

    getText() {
        if (this.domObject) {
            return this.domObject.value;
        }
        return "";
    }
}

class KDCanvas extends KDVisualComponent {
    constructor() {
        super();
        this.htmlName = "canvas";
    }

    radians(degrees) { return (Math.PI / 180) * degrees; }

    context2d() {
        if (this.domObject) {
            return this.domObject.getContext("2d");
        }
        return false;
    }

}


/** 
 * KDScript encapsulate a javascript (or wherever text) wich could be
 * get from a server request.
 * Usage:
 * var s = new KDScript()
 * s.load(url, true); -> first argument is URL to be loaded.
 * 
 * */
class KDScript extends KDComponent {
    constructor() {
        super();
        this.htmlName = "script";
        this.published = false;
        this.params = new Array();

    }

    addParameter(key, value) {
        var o = { "key": key, "value": value };
        this.params.push(o);
        return this;
    }

    build() {
        super.build();
        this.domObject.setAttribute("type", "text/javascript");
        return this;
    }

    publish() {
        this.published = true;
        super.publish(kdHeadTag);
        return this;
    }


    /**
     * @param url URL wich will be execute
     * @param async Boolean means if script will be execute inmediatly
     * */
    load(url, async) {
        //Remove script if exits in DOM
        if (this.published) {
            kdHeadTag.domObject
                .removeChild(this.domObject);
        }

        //build parameters:
        var suffix = "?";
        for (let p of this.params) {
            suffix += p.key + "=" + encodeURI(p.value) + "&";

        }

        if (this.params.length == 0) suffix = "";

        //Build, publish (or republish)
        if (async == undefined) async = true;
        this.build();
        this.publish();
        this.domObject.setAttribute("src", url + suffix);
        this.domObject.setAttribute("async", async);
        return this;
    }

    /* Intended to reuse script */
    reset() {
        var pn = this.domObject.parentNode || document.body;
        pn.removeChild(this.domObject);
        pn.appendChild(this.domObject);
        return this;
    }
}

/** 
 * This class wrap a HTML FORM*/
class KDForm extends KDVisualComponent {
    constructor() {
        super();
        this.htmlName = "form";
        this.method = "post";
        this.style.backgroundColor = "";
        this.url = "";

    }

    build() {
        super.build();
        this.domObject.method = this.method;
        this.domObject.action = this.url;
        this.setSize(new KDSize(0, 0));
        return this;
    }

    submit() {
        if (!this.domObject) {
            this.build().publish();
        }
        this.domObject.submit();
    }

}

/** Simple hidden
 * */
class KDHidden extends KDVisualComponent {
    constructor() {
        super();
        this.htmlName = "input";
        this.htmlType = "hidden";
        this.name = "noname";
        this.value = "novalue";

    }

    setName(name) {
        this.name = name;
        if (this.domObject.value) {
            this.domObject.name = name;

        } else {
            //  this.throwException("KDHidden object has not been builded and published yet");
        }
        return this;
    }

    setValue(value) {
        this.value = value;
        if (this.domObject.value) {
            this.domObject.value = value;
        } else {
            // this.throwException("KDHidden object has not been builded and published yet");
        }
        return this;
    }

    build() {
        super.build();
        this.domObject.value = this.value;
        this.domObject.name = this.name;
        return this;
    }
}


class KDIFrame extends KDVisualComponent {
    constructor() {
        super();
        this.htmlName = "IFRAME";
    }
    publish() {
        super.publish(kdHeadTag);
    }
}


/**
 * Wrap a form and hidden fields to send values to a script
 * @example var sender = new KDSender("myURL.php");
 * 
 * 
 * */
class KDSender extends KDObject {

    set(key, value) {
        var h = new KDHidden();
        h.build().publish(this.form);
        h.setName(key).setValue(value);
        return this;
    }

    submit() {
        
        this.form.submit();

        //Self clear form:
        if (this.timeToClear > 0) {
            var theForm = this.form.domObject;
            window.setTimeout(function () { for (let e of theForm.childNodes) { e.parentNode.removeChild(e); } }, this.timeToClear);
        }
        return this;
    }

    setUrl(url) {
        this.url = url;
        this.form.url = url;
        if (this.form.domObject) { this.form.domObject.action = url; }
        return this;
    }


    constructor(url, kdIframe, timeToClear) {
        super();
        this.url = url;
        this.iframe = kdIframe == undefined ? new KDIFrame() : kdIframe;
        this.timeToClear = timeToClear == undefined ? 10000 : timeToClear;
        this.iframe.style.visibility = "hidden";
        this.form = new KDForm();
        this.form.url = url;
        this.form.method = "POST";

        //Construction process
        this.iframe.build().publish(kdHeadTag);
        this.iframe.domObject.name = this.iframe.getId();
        this.form.build().publish();
        this.form.domObject.target = this.iframe.getId();

        return this;

    }

}


/** INCOMPLETE */
class KDSpriteViewer extends KDLayer {
    constructor() {
        super();
        this.image = new KDImage();

        this.initX = 0;
        this.initY = 0;
        this.spriteWidth = 32;
        this.spriteHeight = 32;
        this.verticalSeparator = 4;
        this.horizontalSeparator = 4;
        // this.spritesForRows = 8;
        this.style.add("backgroundColor", "transparent")
            .add("border", "0px")
            .add("padding", "0px")
            .add("margin", "0px");
        this.image.style = this.style;
    }

    setParameters(initX,
        initY,
        spriteWidth,
        spriteHeight,
        horizontalSeparator,
        verticalSeparator
    ) {

        this.initX = initX;
        this.initY = initY;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.horizontalSeparator = horizontalSeparator;
        this.verticalSeparator = verticalSeparator;

        //this.spritesForRows = spritesForRows;

        this.setSize(new KDSize(spriteWidth, spriteHeight));

        return this;

    }

    loadImage(url, width, height) {
        if (this.image.domObject) {
            this.image.setSource(url);
            this.image.setSize(new KDSize(width, height));
        }
        return this;
    }

    build() {
        super.build();
        this.image.build();
        return this;

    }

    publish(kdObject) {
        super.publish(kdObject);
        this.image.publish(this);
        this.domObject.style.overflow = "hidden";
        return this;
    }

    setSpritePosition(kdPosition) {
        this.image.setPosition(kdPosition);
        return this;
    }

    showSprite(row, column) {
        // var x = this.initX + this.horizontalSeparator  + (row * (this.spriteWidth+this.horizontalSeparator));
        // var y = this.initY + this.verticalSeparator + 1 + (column * (this.spriteHeight+this.verticalSeparator));


        var x = this.initX + (column * (this.spriteWidth + this.horizontalSeparator));
        var y = this.initY + (row * (this.spriteHeight + this.verticalSeparator));


        this.image.setPosition(new KDPosition(-x, -y));
        return this;
    }


}/**
 * Manage async task
 * @param scriptGeneratorURL Pointer to a script (ex. a PHP script) wich
 * change the javascript  
 * */
class KDAsyncTask extends KDObject {

    constructor() {
        super();

        /** URL of script wich will be execute */
        this.scriptExecutorURL = "defaultTask.js";
        this.scriptGeneratorURL = "asyncTask.php";
        this.timerHandler = undefined;
        this.timeBetweenCalls = 3000;
        this.script = new KDScript().build().publish();
       
        //Internal form to send data to server
        this.toServer = new KDSender(this.scriptGeneratorURL).build().publish();

        /** Called when script is loaded */
        this.callback = function () { };
    }

    setScriptExecutor(url) {
        this.scriptExecutorURL = url;
        return this;
    }

    setScriptGenerator(url) {
        this.scriptGeneratorURL = url;
        return this;
    }

    /** Send code string to URL file wich will execute */
    send(code) {
        this.toServer
            .set("command", "send")
            .set("parameters", code)
            .set("scriptURL", this.scriptExecutorURL)
            .send();
        return this;
    }

    loop(obj) {
        var old = document.getElementById(obj.script.getId());
        if (old) {
            document.body.removeChild(old);
            document.body.appendChild(obj.script.domObject);
            obj.script.domObject.addEventListener("load", obj.callback);
        }
        console.log(obj.script);
        obj.script.load(obj.scriptExecutorURL);

    }

    start() {
        this.timerHandler = window.setInterval(this.loop, this.timeBetweenCalls, this);
    }

    stop() {
        window.clearInterval(this.timerHandler);
    }

    reset() {
        this.toServer
            .set("command", "reset")
            .set("parameters", "")
            .set("scriptURL", this.scriptExecutorURL)
            .send();
        return this;
    }
}class KDWindowTheme {
    constructor() {

        this.frame = new KDStyle();
        this.head = new KDStyle();
        this.body = new KDStyle();
        this.foot = new KDStyle();
        this.commandArea = new KDStyle();

        //By default:
        this.frame.boxShadow = "10px 10px 10px gray";
        this.head.backgroundColor = "gold";
        this.head.borderStyle = "solid";
        this.head.borderWidth = "1px";

        this.body.copyFrom(this.head);
        this.foot.copyFrom(this.head);

        this.body.backgroundColor = "oldLace";
        this.foot.backgroundColor = "wheat";
        this.head.textAlign = "center";

        this.frame.zIndex = 1;


    }

    apply(kdWindow) {
        this.frame.apply(kdWindow);
        this.head.apply(kdWindow.head);
        this.body.apply(kdWindow.body);
        this.foot.apply(kdWindow.foot);
    }
}

var KDWindowThemeByDefault = new KDWindowTheme();

/** Window class */
class KDWindow extends KDLayer {
    constructor() {
        super();
        this.head = new KDLayer();
        this.body = new KDLayer();
        this.foot = new KDLayer();
        this.commandArea = new KDLayer();
        this.hideCommand = new KDLayer();
        this.headHeight = 30;
        this.foodHeight = 30;
        this.commandWidth = 30;
        this.theme = KDWindowThemeByDefault;
        this.desktop = false;
        /** This method can be used for make window layout */
        this.onSetSizeEvent = function (kdSize) { return kdSize; }
    }

    build() {
        super.build(); //Build frame
        super.add(this.head);
        super.add(this.body);
        super.add(this.foot);
        super.add(this.commandArea);
        this.commandArea.showCenterText("&#x2193");
        var theWindow = this;
        var commandArea = this.commandArea;
        this.commandArea.domObject.addEventListener("click", function () { theWindow.hide() });
        this.commandArea.domObject.addEventListener("mouseover", function () { commandArea.domObject.style.backgroundColor = "blue"; });
        this.commandArea.domObject.addEventListener("mouseout", function () { commandArea.domObject.style.backgroundColor = theWindow.head.style.backgroundColor; });
        this.head.domObject.addEventListener("click", function () { theWindow.setOnTop(); });
        return this;
    }

    publish(kdDesktop) {
        super.publish(kdDesktop);
        this.desktop = kdDesktop;
        kdDesktop.windows.push(this);
        this.head.publish(this);
        this.body.publish(this);
        this.foot.publish(this);
        this.commandArea.publish(this);
        this.theme.apply(this);
        this.head.setDraggable(true, this);
        return this;
    }

    setSize(kdSize) {
        super.setSize(kdSize);
        this.head.setSize(new KDSize(kdSize.width, this.headHeight));
        this.body.setSize(new KDSize(kdSize.width, kdSize.height - this.headHeight - this.foodHeight));
        this.foot.setSize(new KDSize(kdSize.width, this.foodHeight));
        this.commandArea.setSize(new KDSize(this.headHeight, this.commandWidth));
        this.head.setPosition(new KDPosition(0, 0));
        this.body.setPosition(new KDPosition(0, this.headHeight));
        this.foot.setPosition(new KDPosition(0, kdSize.height - this.foodHeight));
        this.commandArea.setPosition(new KDPosition(0, 0));
        this.onSetSizeEvent(kdSize);
        return this;
    }


    /** Add a child component */
    add(kdComponent) {
        if (this.domObject) {
            kdComponent.publish(this.body);
        }
    }

    setTitle(title) {
        if (this.domObject) {
            this.head.showCenterText(title);
        }
        return this;
    }

    setOnTop() {
        
        this.style.add("zIndex", this.desktop.windowZIndex++);
        this.style.apply(this);
    }
}/** Helper class to parse arguments */
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

        commandLine.domObject.addEventListener("keypress", function (e) {
            if (e.code == "Enter") {
                if (commandLine.getText() == "") {
                    kdTerminal.newCommandLine(kdTerminal);
                } else {
                    kdTerminal.proccessCommand(kdTerminal, commandLine.getText());
                    kdTerminal.saveLine(kdTerminal, commandLine.getText());
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
            t += "\r\n\t value:" + m.values;
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

        /* Remote messages handlers: */
        this.remoteMessageReplicatorURL = "kd-messages-replicator.php";
        this.getLastIndexURL = "kd-messages-get-last-index.php";
        this.remoteMessageQueue = "kd-messages-queue.js";
        this.messageSender = new KDSender(this.remoteMessageReplicatorURL);
        this.lastMessageIndex = -1;
        this.timeBetweenMessagesRequest = 10000; //Time to request messages from server

    }

    build() {
        super.build();
        //this.messageSender.build();
        return this;
    }

    publish(kdComponent) {
        super.publish(kdComponent);
        //this.messageSender.publish();
        return this;
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
            if (kdMessage.destinationIdentifier == "*" || kdMessage.destinationIdentifier == app.identifier) {
                app.processMessage(kdMessage)
            }
        }

    }


    /** Filter messages to be broadcasting considering its index
     * */
    broadcastLocalMessageWithIndex(kdMessage) {
        if (kdMessage.index > this.lastMessageIndex) {
            this.broadcastLocalMessage(kdMessage);
        }
        this.lastMessageIndex = kdMessage.index;
    }


    /** This method send the message to the server. 
     * The server get this messsage and put it on a queue.
     * Each network nod kd desktop request to server for scann new messages incomming.
     * Each desktop download last messages and decodify it to obtain most recient.
     * */
    broadcastRemoteMessage(kdMessage) {
        this.messageSender.set("d", this.getNameOfInstance());
        this.messageSender.set("m", kdMessage.exportJSON());
        this.messageSender.submit();
    }

    /** Loop for request messages */
    requestMessagesLoop(kdDesktop) {
        var request = new KDScript()
            .build()
            .publish()
            .load(kdDesktop.remoteMessageQueue)
            .selfDestroy(kdDesktop.timeBetweenMessagesRequest);
    }

    /** Start request messages to server */
    startRequestMessages() {
        var request = new KDScript().build()
            .publish()
            .addParameter("d", this.getNameOfInstance())
            .load(this.getLastIndexURL)
            .selfDestroy(20000);
        this.requestMessagesHanlder = window.setInterval(this.requestMessagesLoop, this.timeBetweenMessagesRequest, this);
    }

    /** Start request messages to server */
    stopRequestMessages() {
        this.requestMessagesHanlder = window.clearInterval(this.requestMessagesHanlder);
    }




}