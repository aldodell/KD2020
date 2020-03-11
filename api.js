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

    loadUser(userName) {
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

        /** send messages to all apps about user change */
        var msg = new KDMessage("kernel", "*");
        msg.setValue("kernel_user_changed", userName);
        this.desktop.sendMessage(msg);

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

    remove() {
        this.domObject.parentNode.removeChild(this.domObject);
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

class KDScript extends KDComponent {
    constructor() {
        super();
        this.htmlName = "script";
        this.published = false;

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
        // var headTag = document.getElementsByTagName("head")[0];
        if (this.published) {
            kdHeadTag.domObject
                .removeChild(this.domObject);
        }

        if (async == undefined) async = true;
        this.build();
        this.publish();
        this.domObject.setAttribute("src", url);
        this.domObject.setAttribute("async", async);

        return this;
    }

    //To reuse script zz3
    reset() {
        var pn = this.domObject.parentNode || document.body;
        pn.removeChild(this.domObject);
        pn.appendChild(this.domObject);
        return this;
    }
}

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

    }

    setValue(value) {
        this.domObject.value = value;
        return this;
    }
}

/**
 * Wrap a form and hidden fields to send values to a script
 * @example var sender = new KDSender("myURL.php");
 * */
class KDSender extends KDVisualComponent {

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

        // this.iframeDomObject
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
        this.destroyTime = 5000;

    }


}


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
        return this;
    }

    publish(domObject) {
        super.publish(domObject);
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
        var sender = new KDSender();

        sender.build()
            .publish()
            .set("senderID", sender.getId())
            .set("line", text)
            .set("userName", kdTerminal.desktop.kernel.currentUser.name)
            .setUrl(kdTerminal.SAVE_LINE_URL)
            .send();
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
        var sender = new KDSender();
        
        sender.build()
            .publish()
            .set("terminal", this.getNameOfInstance())
            .set("userName", this.desktop.kernel.currentUser.name)
            .setUrl(this.LOAD_LINES_URL)
            .send();

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
    run() {
        this.mainWindow.show();
        this.currentCommandLine.domObject.focus();
    }


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
        this.desktop.sendMessage(m);

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
        this.remoteMessagesProcessor = new KDScript();
        this.remoteMessagesProcessorTime = 1000;

        this.messageReplicatorURL = "kd-messages-replicator.php";
        this.messageResetURL = "kd-messages-reset.php";
        this.remoteMessageQueueURL = "kd-messages-queue.js";

        this.remoteMessagesTimer = 0;
        this.lastMessageIndex = -1;

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

}var data = new Object();

class QQSMBox extends KDLayer {

    constructor() {
        super()
        this.questionFrame = new KDCanvas();
        this.questionLabel = new KDLayer();

        this.normalBoxStyle = new KDStyle()
            .add("backgroundColor", "transparent")
            .add("fontSize", 22)
            .add("textShadow", "2px 1px gray")
            .add("color", "white")
            .add("border", "");

        this.selectedBoxStyle = new KDStyle()
            .add("backgroundColor", "orange")
            .add("fontSize", 22)
            .add("textShadow", "2px 1px gray")
            .add("color", "white")
            .add("border", "");


    }

    build() {
        super.build();
        this.questionFrame.build();
        this.questionLabel.build();

        return this;
    }


    applyStyle(kdStyle) {
        kdStyle.apply(this)
            .apply(this.questionFrame)
            .apply(this.questionLabel);
    }


    publish(kdVisualComponent) {
        super.publish(kdVisualComponent);
        this.questionFrame.publish(this);
        this.questionLabel.publish(this);

        this.normalBoxStyle.apply(this)
            .apply(this.questionFrame)
            .apply(this.questionLabel);

        return this;
    }

    setSize(kdSize) {

        super.setSize(kdSize);
        this.questionFrame.setSize(kdSize);
        this.questionLabel.setSize(kdSize.offset(-60, -20));
        this.questionLabel.setPosition(new KDPosition(30, 15));


        //set up canvas
        this.questionFrame.domObject.width = kdSize.width;
        this.questionFrame.domObject.height = kdSize.height;
        var ctx;

        // Positions
        var pp = new Array();

        pp[0] = (new KDPosition(0, kdSize.height / 2));
        pp[1] = pp[0].offset(10, 0);
        pp[2] = pp[1].offset(10, -10);
        pp[3] = pp[2].offset(10, 0); pp[3].y = 10;
        pp[4] = pp[3].offset(kdSize.width - 60, 0);
        //
        pp[5] = new KDPosition(kdSize.width, pp[0].y);
        pp[6] = pp[5].offset(-10, 0);
        pp[7] = pp[6].offset(-10, -10);

        pp[8] = pp[1].offset(10, 10);
        pp[9] = pp[8].offset(10, 0); pp[9].y = kdSize.height - 10;
        pp[10] = pp[4].offset(0, 0);
        pp[10].y = pp[9].y;
        pp[11] = pp[6].offset(-10, 10);

        //Draw question frame
        ctx = this.questionFrame.context2d();

        ctx.moveTo(pp[0].x, pp[0].y);
        ctx.lineTo(pp[1].x, pp[1].y);
        ctx.quadraticCurveTo(
            pp[2].x,
            pp[2].y,
            pp[3].x,
            pp[3].y);
        ctx.lineTo(pp[4].x, pp[4].y);

        ctx.moveTo(pp[5].x, pp[5].y);
        ctx.lineTo(pp[6].x, pp[6].y);

        ctx.quadraticCurveTo(
            pp[7].x,
            pp[7].y,
            pp[4].x,
            pp[4].y);

        ctx.moveTo(pp[1].x, pp[1].y);
        ctx.quadraticCurveTo(
            pp[8].x,
            pp[8].y,
            pp[9].x,
            pp[9].y);

        ctx.lineTo(pp[10].x, pp[10].y);
        ctx.moveTo(pp[6].x, pp[6].y);
        ctx.quadraticCurveTo(
            pp[11].x,
            pp[11].y,
            pp[10].x,
            pp[10].y);

        var grd = ctx.createLinearGradient(0, 0, this.questionLabel.size.width, 0);
        grd.addColorStop(0, "white");
        grd.addColorStop(0.5, "black");
        grd.addColorStop(1, "white");


        ctx.strokeStyle = grd;
        ctx.lineWidth = 2;
        ctx.stroke();

        return this;
    }

    setText(text) {
        this.questionLabel.domObject.innerHTML = text;
        return this;
    }
}

class QQSM extends KDApplication {

    constructor(kdDesktop) {
        super(kdDesktop, "qqsm");
        this.title = "Millonario";
        this.filename = "";
        this.indexQuestion = -1;


        this.mainWindow = new KDWindow().build()
            .setSize(new KDSize(800, 800))
            .publish(kdDesktop)
            .hide();

        this.nova = new KDLayer().build()
            .publish(this.mainWindow.body);

        this.question = new QQSMBox().build()
            .publish(this.mainWindow.body);

        this.optionA = new QQSMBox().build()
            .publish(this.mainWindow.body);

        this.optionB = new QQSMBox().build()
            .publish(this.mainWindow.body);

        this.optionC = new QQSMBox().build()
            .publish(this.mainWindow.body);

        this.optionD = new QQSMBox().build()
            .publish(this.mainWindow.body);

        this.playButton = new KDButton().build()
            .publish(this.mainWindow.foot)
            .setText(">>");




        //Set up background style
        var backgroundStyle = new KDStyle();
        backgroundStyle.add("backgroundImage", "linear-gradient(to top right, black, darkblue, indigo, navy)")
            .apply(this.mainWindow.body);

        //set up nova style
        var novaStyle = new KDStyle()
        novaStyle.add("backgroundColor", "transparent")
            .add("backgroundImage", "radial-gradient(white 5%,fuchsia 15%, rgba(0,0,255,0.1) 60%, rgba(0,0,0,0.01) 1%")
            .add("border", "")
            .apply(this.nova);



        this.setSize = function (kdSize) {

            this.mainWindow.setSize(kdSize);

            var verticalSeparator = 10;
            var horizontalSeparator = 8;
            var questionHeight = kdSize.height / 2.5;
            var answerHeight = questionHeight / 2;
            var answerWidth = (this.mainWindow.body.size.width / 2) - (horizontalSeparator / 2);
            var questionWidth = this.mainWindow.body.size.width;
            var row0 = this.mainWindow.body.size.height / 20;
            var row1 = row0 + verticalSeparator + questionHeight;
            var row2 = row1 + answerHeight + verticalSeparator;
            var col0 = 0;
            var col1 = horizontalSeparator + answerWidth;
            var novaXY = this.mainWindow.size.height / 8;


            this.nova.setPosition(new KDPosition(this.mainWindow.body.size.width - 2 * novaXY, novaXY / 2))
                .setSize(new KDSize(2 * novaXY, 2 * novaXY - verticalSeparator));

            this.question.setPosition(new KDPosition(col0, row0))
                .setSize(new KDSize(questionWidth, questionHeight))
                .setText("Hello world, come with us and share life,Hello world, come with us and share life,Hello world, come with us and share life.");

            this.optionA.setPosition(new KDPosition(col0, row1))
                .setSize(new KDSize(answerWidth, answerHeight))
                .setText("A");

            this.optionB.setPosition(new KDPosition(col1, row1))
                .setSize(new KDSize(answerWidth, answerHeight))
                .setText("B");

            this.optionC.setPosition(new KDPosition(col0, row2))
                .setSize(new KDSize(answerWidth, answerHeight))
                .setText("C");

            this.optionD.setPosition(new KDPosition(col1, row2))
                .setSize(new KDSize(answerWidth, answerHeight))
                .setText("D");

            this.playButton.setPosition(new KDPosition(0, 0))
                .setSize(new KDSize(100, 20));

            this.mainWindow
                .setPosition(KDPosition.centerScreen(this.mainWindow.getSize()))

        }

        //Draw again all
        this.setSize(new KDSize(800, 600));

    }


    loadData() {
        if (this.filename != "") {
            alert("loading " + this.filename);
            var loader = new KDScript().build().publish();
            loader.load(this.filename);
        }
    }


    showQuestion() {
        this.question.setText(data[this.indexQuestion].q);
        this.optionA.setText(data[this.indexQuestion].a);
        this.optionB.setText(data[this.indexQuestion].b);
        this.optionC.setText(data[this.indexQuestion].c);
        this.optionD.setText(data[this.indexQuestion].d);

    }

    nextQuestion() {
        this.indexQuestion++;
        this.showQuestion();

    }


    backQuestion() {
        this.indexQuestion--;
        this.showQuestion();

    }


    answerA() {
        this.optionA.applyStyle(this.optionA.selectedBoxStyle);
    }

    answerB() {
    }

    answerC() {
    }

    answerD() {
    }

    run(args) {

        this.mainWindow.show();
        this.indexQuestion = -1;
        var thisObj = this;
        this.playButton.domObject.addEventListener("click", function () { thisObj.nextQuestion() }, true);

        var msg = "QQSM:\r\n";
        if (args != undefined) {
            args.push(";");
            var i = 0;
            for (i = 0; i < args.length - 1; i++) {
                var c = args[i];
                var p = args[i + 1];

                //Command for load file
                if (c == "-f") {
                    this.filename = p;
                    this.loadData();
                    msg += "\t File loaded: " + p + "\r\n";
                }

                //Commando to change window size
                if (c == "-w") {
                    this.setSize(new KDSize(parseInt(args[i + 1]), parseIt(args[i + 2])));
                    msg += "\t Size changed to " + args[i + 1] + " x " + args[i + 2] + "\r\n";
                }
            }

        }

        return msg;
    }

    processMessage(kdMessage) {
        if (kdMessage.destinationIdentifier == this.identifier) {
            if (kdMessage.getValue("show") == "next") {
                this.nextQuestion();
            }

            if (kdMessage.getValue("show") == "back") {
                this.backQuestion();
            }

            //Change size overload zz55
            if (kdMessage.getValue("command") == "changeSize") {
                var w = parseInt(kdMessage.getValue("width"));
                var h = parseInt(kdMessage.getValue("height"));
                this.setSize(new KDSize(w, h));
            }
        }

    }



}


class QQSM_control extends KDApplication {

    constructor(kdDesktop) {
        super(kdDesktop, "qqsm-control");
        this.title = "QQSM Control";
        this.identifier = "qqsm-contol";
        this.filename = "";
        this.indexQuestion = -1;

        /** GUI */

        //main window
        this.mainWindow = new KDWindow().build()
            .setSize(new KDSize(400, 400))
            .setPosition(new KDPosition(0, 0))
            .publish(kdDesktop)
            .hide();

        //next button
        this.nextButton = new KDButton().build()
            .publish(this.mainWindow.body)
            .setSize(new KDSize(200, 60))
            .setPosition(new KDPosition(10, 10))
            .setText("Next");

        //back button
        this.backButton = new KDButton().build()
            .publish(this.mainWindow.body)
            .setSize(new KDSize(200, 60))
            .setPosition(new KDPosition(10, 80))
            .setText("Back");

        //zz1
        this.nextButton.domObject.app = this;
        this.nextButton.domObject.addEventListener("click", function (e) {

            var m = new KDMessage(this.app.identifier, "qqsm");
            m.setValue("show", "next");
            this.app.desktop.sendRemoteMessage(m);

        });

        this.backButton.domObject.app = this;
        this.backButton.domObject.addEventListener("click", function (e) {

            var m = new KDMessage(this.app.identifier, "qqsm");
            m.setValue("show", "back");
            this.app.desktop.sendRemoteMessage(m);

        });

    }

    run(args) {
        this.mainWindow.show();
        this.mainWindow.setAvailableScreenSize();

        this.nextButton
            .setSize(new KDSize(this.getSize().width - 20, 100))
            .setPosition(new KDPosition(10, 10));

        this.backButton
            .setSize(new KDSize(this.getSize().width - 20, 100))
            .setPosition(new KDPosition(10, 120));

    }

}

