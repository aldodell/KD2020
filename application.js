class KDApplication extends KDObject {
    constructor(kdDesktop, identifier) {
        super();
        this.desktop = kdDesktop;
        this.icon = new KDImage();
        this.title = "This is a generic application test";
        this.identifier = identifier == undefined ? "generic application" : undefined;
        kdDesktop.applications.add(this);

    }
    run() {
        alert("OVERRIDE run METHOD");
    }
}