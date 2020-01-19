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
    }

    /** Copy all styles from other KDStyle object */
    copyFrom(kdStyle) {
        for (let s in kdStyle) {
            this[s] = kdStyle[s];
        }
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
                kdComponent.build();
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
}


/** Visual components base classes
 * */
class KDVisualComponent extends KDComponent {
    constructor() {
        super();
        this.style = new KDStyle();
        this.draggable = false;
        this.moving = false;
        this.initialPosition = null;
        this.position = null;
        this.size = new KDSize(100, 20);
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
            }
        } else {
            this.domObject.removeEventListener("mouseout", this, true);
            this.domObject.removeEventListener("mouseup", this, true);
            this.domObject.removeEventListener("mousedown", this, true);
            this.domObject.removeEventListener("mousemove", this, true);

        }
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
    }
}







class KDWindowTheme {
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

}/** 
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

    }

    /** 
     * Desktop script call run() method in order to
     * make alive the application.
     * This is a entry point.
     * */
    run() {
        alert("Must override run() method on '" + this.identifier + "' application.");
    }
}


class KDTerminal extends KDApplication {
    constructor(kdDesktop) {
        super(kdDesktop, "KDTerminal");
        this.iconURL = "apps/KDTerminal/media/bash.png";
        this.title = "Terminal";
        var mainWindowSize = new KDSize(600, 400);
        this.mainWindow = new KDWindow()
            .publish(kdDesktop)
            .setSize(mainWindowSize)
            .setPosition(KDPosition.centerScreen(mainWindowSize))
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
    }

    proccessCommand(kdTerminal, text) {

        if (text == "?") {
            kdTerminal.newOuputLayer(kdTerminal, "Help:");
            return true;
        }

        var i;
        for (i = 0; i < kdTerminal.desktop.applicationsIntances.length; i++) {
            var app = kdTerminal.desktop.applicationsIntances[i];
            if (app.identifier == text) {
                app.run();
                this.newCommandLine(kdTerminal);
                return true;
            }
        }
        kdTerminal.newOuputLayer(kdTerminal, text + " is not a valid command.");
    }

    newOuputLayer(kdTerminal, htmlText) {
        var ouputLayer = new KDLayer().build();
        ouputLayer.publish(kdTerminal.mainWindow.body);
        ouputLayer.domObject.innerHTML = htmlText;
        kdTerminal.lineStyle.apply(ouputLayer);
        kdTerminal.newCommandLine(kdTerminal);
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
                for (i = 0; i < kdTerminal.desktop.applicationsIntances.length; i++) {
                    var app = kdTerminal.desktop.applicationsIntances[i];
                    k = app.identifier.indexOf(t);
                    l = t.length;
                    if (k == 0) {
                        commandLine.appendText(app.identifier.substr(l));
                        return true;
                    }
                }

            }
        });

        kdTerminal.lineStyle.apply(commandLine);
        commandLine.domObject.focus();
        kdTerminal.currentCommandLine = commandLine;
    }
    run() {
        this.mainWindow.show();
        this.currentCommandLine.domObject.focus();
    }


}
/**
 * Desktop manager classes
 * */
class KDDesktop extends KDVisualComponent {
    constructor() {
        super();
        this.applicationsClasses = new Array();
        this.applicationsIntances = new Array();
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
       
        appIconStyle.backgroundColor = "transparent";
        appIconStyle.border = "";


        var i = 0;
        for (i = 0; i < this.applicationsClasses.length; i++) {
            this.applicationsIntances[i] = new this.applicationsClasses[i](this);

            var appLayer = new KDLayer().build()
                .setSize(appLayerSize)
                .setPosition(appLayerPosition.move(appLayerWidth, appLayerHeight + (i * appLayerHeight)))
                .setDraggable(true)
                .publish(this);

            var appIcon = new KDImage().build()
                .setSource(this.applicationsIntances[i].iconURL)
                .setPosition(appIconPosition)
                .setSize(appIconSize)
                .publish(appLayer);

            var appLabel = new KDLayer().build()
                .showCenterText(this.applicationsIntances[i].title)
                .setPosition(appLayerLabelPosition)
                .publish(appLayer);

            appIconStyle.apply(appLayer);
            appIconStyle.apply(appLabel);
            appIconStyle.apply(appIcon);
            kdIconFont.apply(appLabel);

            appLayer.domObject.app = this.applicationsIntances[i];
            appLayer.domObject.ondblclick = function () { this.app.run() };
            appIcon.domObject.ondragstart = function () { return false; };

        }
    }

}



