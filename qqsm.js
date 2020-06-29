/**
¿Quién quiere ser millonario?
Aplicación de prueba
*/

class QQSM extends KDApplication {
    constructor(kdDesktop) {
        super(kdDesktop, "qqsm");
        this.title = "QQSM";
        var mainWindowSize = new KDSize(600, 400);
        this.questionIndex = -1;

        //Draw main window
        this.mainWindow = new KDWindow()
            .publish(kdDesktop)
            .setSize(mainWindowSize)
            .setPosition(KDPosition.centerScreen(mainWindowSize))
            .setTitle(this.title)
            .hide();

        //Draw question box and its styes
        this.questionBoxStyle = new KDStyle();
        this.questionBoxStyle.backgroundColor = "gray";
        this.questionBox = new KDLayer().build();
        this.questionBoxStyle.apply(this.questionBox);
        this.mainWindow.add(this.questionBox);


        //Options style
        this.optionStyle = new KDStyle();
        this.optionStyle.backgroundColor = "navy";

        //Draw option A
        this.optionA = new KDButton().build();
        this.optionStyle.apply(this.optionA);
        this.mainWindow.add(this.optionA);

        //Draw option B
        this.optionB = new KDButton().build();
        this.optionStyle.apply(this.optionB);
        this.mainWindow.add(this.optionB);

        //Draw option C
        this.optionC = new KDButton().build();
        this.optionStyle.apply(this.optionC);
        this.mainWindow.add(this.optionC);


        //Draw option D
        this.optionD = new KDButton().build();
        this.optionStyle.apply(this.optionD);
        this.mainWindow.add(this.optionD);


        //Performing layout when size change programmatically
        this.mainWindow.app = this;

        //Build arragement object
        this.arragementList = new KDArrangementList();

        this.arragementList.addRow(new KDArrangementRow().add(this.questionBox));
        this.arragementList.addRow(new KDArrangementRow().add(this.optionA).add(this.optionB));
        this.arragementList.addRow(new KDArrangementRow().add(this.optionC).add(this.optionD));


        this.mainWindow.onSetSize = function (win, size) {
    
            win.app.arragementList.arrange(new KDPosition(0, 0), size);

            /*
             var t = kdSize.height / 70;
             var questionHeight = kdSize.height * 0.4;
             var optionHeight = kdSize.height * 0.2;
             var optionWidth = (kdSize.width - (3 * t)) / 2;
             var optionSize = new KDSize(optionWidth, optionHeight);
             win.app.questionBox.performLayout(new KDPosition(t, t), new KDSize(kdSize.width - (2 * t), questionHeight));
             win.app.optionA.performLayout(new KDPosition(t, t + questionHeight + t), optionSize);
             win.app.optionB.performLayout(new KDPosition(t + optionWidth + t, t + questionHeight + t), optionSize);
             win.app.optionC.performLayout(new KDPosition(t, t + questionHeight + t + optionHeight + t), optionSize);
             win.app.optionD.performLayout(new KDPosition(t + optionWidth + t, t + questionHeight + t + optionHeight + t), optionSize);
         
         */


        };


    }


    loadQuestion() {
        this.questionIndex++;
        this.questionBox

    }


    //overloading run()
    run() {

        this.mainWindow.show();
        this.mainWindow.setSize(new KDSize(600, 500));

    }
}