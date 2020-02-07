class QQSMBox extends KDLayer {

    constructor() {
        super()
        this.questionFrame = new KDCanvas();
        this.questionLabel = new KDLayer();

    }

    build() {
        super.build();
        this.questionFrame.build();
        this.questionLabel.build();

        return this;
    }

    publish(kdVisualComponent) {
        super.publish(kdVisualComponent);
        this.questionFrame.publish(this);
        this.questionLabel.publish(this);


        var boxStyle = new KDStyle()
            .add("backgroundColor", "transparent")
            .add("fontSize", 22)
            .add("textShadow", "2px 1px gray")
            .add("color", "white")
            .add("border", "")
            .apply(this)
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

    nextQuestion() {
        this.indexQuestion++;
        this.question.setText(data[this.indexQuestion].q);
        this.optionA.setText(data[this.indexQuestion].a);
        this.optionB.setText(data[this.indexQuestion].b);
        this.optionC.setText(data[this.indexQuestion].c);
        this.optionD.setText(data[this.indexQuestion].d);
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

        this.mainWindow = new KDWindow().build()
            .setSize(new KDSize(400, 400))
            .setPosition(new KDPosition(0, 0))
            .publish(kdDesktop)
            .hide();

        this.nextButton = new KDButton().build().publish(this.mainWindow.body)
            .setSize(new KDSize(200, 60))
            .setText("Next");
    }

    run(args) {
        this.mainWindow.show();
        this.mainWindow.setAvailableScreenSize();
        //zz1
        this.nextButton.domObject.app = this;
        this.nextButton.domObject.addEventListener("click", function (e) {

            var m = new KDMessage(this.app.identifier, "qqsm");
            m.appendValue("show", "next");
            this.app.desktop.sendRemoteMessage(m);

        });
    }
}

