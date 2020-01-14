

class KDWindowTheme {
    constructor() {

        this.frame = new KDStyle();
        this.head = new KDStyle();
        this.body = new KDStyle();
        this.foot = new KDStyle();

        //By default:
        this.frame.boxShadow = "10px 10px 10px gray";
        this.head.backgroundColor = "gold";
        this.head.borderStyle = "solid";
        this.head.borderWidth = "1px";

        this.body.copyFrom(this.head);
        this.foot.copyFrom(this.head);

        this.body.backgroundColor = "oldLace";
        this.foot.backgroundColor = "wheat";
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
        this.headHight = 30;
        this.footHight = 30;
        this.theme = KDWindowThemeByDefault;
    }

    build() {
        super.build();
        super.add(this.head);
        super.add(this.body);
        super.add(this.foot);
        return this;
    }

    publish(domObject) {
        super.publish(domObject);
        this.head.publish(this);
        this.body.publish(this);
        this.foot.publish(this);
        this.theme.apply(this);
        this.head.setDraggable(true, this);

        return this;
    }

    setSize(kdSize) {
        super.setSize(kdSize);
        this.head.setSize(new KDSize(kdSize.width, this.headHight));
        this.body.setSize(new KDSize(kdSize.width, kdSize.head - this.headHight - this.footHight));
        this.foot.setSize(new KDSize(kdSize.width, this.footHight));
        this.head.setPosition(new KDPosition(0, 0));
        this.body.setPosition(new KDPosition(0, this.headHight));
        this.foot.setPosition(new KDPosition(0, kdSize.height - this.footHight));
        return this;
    }


    /** Add a child component */
    add(kdComponent) {
        if (this.domObject) {
            kdComponent.publish(this.body);
        }
    }

}