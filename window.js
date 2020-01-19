

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

}