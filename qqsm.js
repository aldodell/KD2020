/**
¿Quién quiere ser millonario?
Aplicación de prueba
*/

class QQSM extends KDApplication {
    constructor(kdDesktop) {
        super(kdDesktop, "qqsm");
        var mainWindowSize = new KDSize(600, 400);

        this.mainWindow = new KDWindow()
            .publish(kdDesktop)
            .setSize(mainWindowSize)
            .setPosition(KDPosition.centerScreen(mainWindowSize))
            .setTitle("QQSM 0.1")
            .hide();



        var questionLayer = new KDLayer()
            .setSize(mainWindowSize)
            .setPosition(KDPosition.centerScreen(mainWindowSize))
            .build()
            .publish();

        this.mainWindow.add(questionLayer);



        this.mainWindow.KDVisualComponent_performLayout = this.mainWindow.performLayout;
        this.mainWindow.performLayout = function (kdPosition, kdSize) {
            this.KDVisualComponent_performLayout(kdPosition, kdSize);
            alert(kdSize);
        }

    }




    //overloading run()
    run() {
        this.mainWindow.show();
        this.mainWindow.performLayout();

    }
}