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
        this.domObject.setAttribute("src", url);
        this.domObject.setAttribute("async", async);
        this.publish();
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
    constructor(url) {
        super();
        this.htmlName = "iframe";
        this.url = url;
        this.form = new KDForm();
        this.form.url = url;
        this.method = "post";
        this.style.visibility = "hidden";
    }

    build() {
        super.build();
        this.form.build();
        this.domObject.setAttribute("name", this.getId());
        this.form.domObject.setAttribute("name", this.getId() + "_form");

        return this;
    }

    publish(kdComponent) {
        super.publish(kdComponent);
        if (this.form.domObject == undefined) this.form.build();
        var ifrdoc = this.domObject.contentDocument || this.domObject.contentWindow.document;
        ifrdoc.body.appendChild(this.form.domObject);
        return this;
    }

    set(name, value) {
        if (this.domObject == undefined) {
            this.build().publish();
        }
        var hidden = new KDHidden().build().publish(this.form);
        hidden.setName(name).setValue(value);

        return this;
    }

    send() {
        if (this.domObject) {
            this.form.submit();
        }
        return this;
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


}