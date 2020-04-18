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
    constructor(index) {
        super(index);

        // HTML tag name
        this.htmlName = "div";
        // HTML type component
        this.htmlType = "";
        //Pointer to DOM representation
        this.domObject = false;
        //Are published?
        this.published = false;
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
        this.published = true;
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
            kdComponent.domObject = null;
            kdComponent = null;
        }
    }

    /** Remove this element from DOM until a time */
    selfDestroy(time) {
        window.setTimeout(this.remove, time, this);
    }


    /** Use to get an existing tag element on DOM */
    wrap(id) {
        this.domObject = document.getElementById(id);
        if (this.domObject == null) {
            this.throwException(id + " doesn't exists on this frame.");
        }
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

    constructor(index) {
        super(index);
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

    publish(kdComponent) {
        super.publish(kdComponent);
        return this;
    }


    /**
     * @param url URL wich will be execute
     * @param async Boolean means if script will be execute inmediatly
     * */
    load(url, async) {
        //Remove script if exits in DOM
        if (this.domObject) {
            this.domObject.parentNode.removeChild(this.domObject);
            this.domObject = null;
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

    getReference() {
        /*
        var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        var iframeHtml = iframeDocument.getElementsByTagName("html")[0];
        this.iframeBody = iframeHtml.getElementsByTagName("body")[0];
        */
        if (this.domObject != null) {
            var iframeDocument = this.domObject.contentDocument || this.domObject.contentWindow.document;
            var iframeHtml = iframeDocument.getElementsByTagName("html")[0];
            this.iframeBody = iframeHtml.getElementsByTagName("body")[0];
        } else {
            this.throwException("KDIframe doesn't exits on DOM. ID=" + this.getId());
        }
        return this;

    }



    publish(kdComponent) {
        super.publish(kdComponent);
        this.getReference();

    }

    wrap(id) {
        super.wrap(id);
        this.getReference();
    }

    constructor() {
        super();
        this.htmlName = "IFRAME";
        this.iframeBody = null;
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
        this.putForm();
        var h = new KDHidden();
        h.build().publish(this.form);
        h.setName(key).setValue(value);
        return this;
    }

    submit() {
        this.form.submit();
        //Self clear form:

        if (this.timeToClear > 0) {
            this.form.selfDestroy(this.timeToClear);
        }
        return this;
    }

    setUrl(url) {
        this.url = url;
        if (this.form) {
            this.form.url = url;
            if (this.form.domObject) {
                this.form.domObject.setAttribute("action", url);
            }
        }
        return this;
    }

    putForm() {
        if (this.form == null || this.form.domObject == null) {
            this.form = new KDForm();
            this.form.url = this.url;
            this.form.method = "POST";
            this.form.build().publish();
            this.form.domObject.setAttribute("target", this.KERNEL_IFRAME_ID);
        }
    }


    constructor(url, timeToClear) {
        super();
        this.KERNEL_IFRAME_ID = "KD-KERNEL-IFRAME";
        this.url = url;
        this.timeToClear = timeToClear == undefined ? 3000 : timeToClear;
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


}