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
        this.head.margin = "0px";
        this.head.padding = "0px";
        this.border = "solid 1px black";


        this.body.copyFrom(this.head);
        this.foot.copyFrom(this.head);
        this.commandArea.copyFrom(this.head);

        this.body.backgroundColor = "oldLace"; //oldLace
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

        /** 
         * This method can be used for make window layout 
         * Must be override 
         * */
        this.onSetSize = function (kdWindow, kdSize) { };
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
        this.commandArea.setSize(new KDSize(this.commandWidth, this.headHeight - 2));
        this.head.setPosition(new KDPosition(0, 0));
        this.body.setPosition(new KDPosition(0, this.headHeight));
        this.foot.setPosition(new KDPosition(0, kdSize.height - this.foodHeight));
        this.commandArea.setPosition(new KDPosition(1, 1));

        this.onSetSize(this, kdSize);
        return this;
    }



    /** Set size and position to fill body area */
    fillBody(kdComponent) {
        kdComponent.setSize(this.body.getSize().offset(-2, -2));
        kdComponent.setPosition(new KDPosition(1, 1));
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


}