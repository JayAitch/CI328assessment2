 var Game = {};

class GameScene extends Phaser.Scene {
    constructor() {
        super({key: 'maingame'});
        this.balls = {};
        this.ballTrailParticles = [];
    }

    create() {
        gameClient.setScene(this);
        this.backdropItems = {
            floors: [ 'sand', 'grass' ],
            pillars: [ 
                { name: 'metalPosts', depth: 0 },
                { name: 'treePosts', depth: 10 }
            ],
            doodads: [ 'doodad1', 'doodad2', 'doodad3', 'doodad4', 'doodad5', 'doodad6',
                       'doodad7', 'doodad8', 'doodad9', 'doodad10', 'doodad11' ]
        };
        
        this.buildBackdrop();
        Game.playerMap = {};
        //var testKey = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        var leftKey = this.input.keyboard.addKey("LEFT");
        var rightKey = this.input.keyboard.addKey("RIGHT");

        // testKey.onDown.add(Client.sendTest, this);

        leftKey.on('down', function(event) {
            Client.sendMove(-1);
            console.log("move -");
        });
        rightKey.on('down', function(event) {
            Client.sendMove(1);
            console.log("move +");
        });
        leftKey.on('up', function(event) {
            Client.sendStopMove();
        });
        rightKey.on('up', function(event) {
            Client.sendStopMove();
        });

        this.createEmitter();

        this.characters = {
            "BIG": {size: 6, eyes: 4, colour: 0x00ffff, type: 'slime'},
            "MEDIUM": {size: 3, eyes: 3, colour: null, type: 'metal'},
            "SMALL": {size: 1, eyes: 4, colour: 0xffff00, type: 'slime'}
        }
    }

    spawnBall(key, x, y) {
        let newBall = this.add.sprite(x, y, "ball");
        this.balls[key] = newBall;
        newBall.newx = x;
        newBall.newy = y;
        this.createBallTrail(newBall);
        newBall.update = ()=> {

            newBall.x = newBall.newx;// * 0.9 + ball.newx * 0.1;
            newBall.y = newBall.newy;// * 0.9 + ball.newy * 0.1;
            // ball.x = ball.x * 0.9 + ball.newx * 0.1;
            // ball.y = ball.y * 0.9 + ball.newy * 0.1;

        }
    }

    spawnPowerUp(x,y){
        // make powerup sprite
        let newBall = this.add.sprite(x, y, "ball");

    }

    buildBackdrop() {
        let randNum = parseInt(Math.random() * this.backdropItems.floors.length);
        this.add.image(400, 400, this.backdropItems.floors[randNum]);
        randNum = parseInt(Math.random() * this.backdropItems.pillars.length);
        let posts = this.add.image(400, 400, this.backdropItems.pillars[randNum].name);
        posts.setDepth(posts.depth + this.backdropItems.pillars[randNum].depth);
        for (let i =0; i < 3; i++) {
            randNum = parseInt(Math.random() * this.backdropItems.doodads.length);
            this.add.image(400, 400, this.backdropItems.doodads[randNum]);
        }
    }

    createEmitter(){
        let particles = this.add.particles('ball');
        particles.setDepth(2);
        this.emitter = particles.createEmitter({
            x: 300,
            y: 300,
            on:false,
            speed: { min: 150, max: 250 },
            lifespan: { min: 200, max: 300 },
            gravityY: 250,
            blendMode: 'ADD',
            scale: 0.2,
            quantity: 5,
        });

    }


    createBallTrail(ball){
        let particles = this.add.particles('ball');
        particles.setDepth(2);
        let ballTrail = particles.createEmitter({
            x: 0,
            y: 0,
            on:true,
            follow:ball,
            speed: { min: -100, max: 100 },
            angle: { min: -120, max: -60 },
            lifespan: { min: 80, max: 200 },
            blendMode: 'ADD',
            scale: {start:0.7,end:0.1},
            quantity: 1,
        });
        this.ballTrailParticles.push(particles);

    }


    goalScored(id){
        let player = Game.playerMap[id];
        player.loseLife();
    }


    killPlayer(id){
        let player = Game.playerMap[id];
        this.removePlayer(id);
    }



    endGame(winnerID){
        let winnerNumber = winnerID +1;
        this.winText = this.add.text(gameCenterX(), gameCenterY(), `Player ${winnerNumber} wins!!` , textStyles.header);
        offsetByWidth(this.winText);

        let playBtnAction =  () => {
            this.scene.switch("lobby");
            this.cleanGameScene();
        };

        // create the button object, no need for an icon, or UI text
        this.playBtn = new ImageButton(
            gameCenterX() - 155,
            game.config.height - 55,
            "playButton",
            this,
            playBtnAction,
            "Again?"
        );



        let lobbySelectionBtnAction = () => {
            // error handle fained connection in lobby switch

            this.scene.switch("lobbyselection");
            this.cleanGameScene();
        };


        // create the button object, no need for an icon, or UI text
        this.lobbySelectionBtn = new ImageButton(
            gameCenterX() +155,
            game.config.height - 55,
            "playButton",
            this,
            lobbySelectionBtnAction,
            "Lobby Selection"
        );


    }

    cleanGameScene(){
        this.winText.destroy();
        this.playBtn.destroy();
        this.lobbySelectionBtn.destroy();
        this.removeTrails();
    }
    // change this to remove balls
    removeTrails(){

        for(let i = 0; i < this.ballTrailParticles.length; i++){
            //cant get this to work should probably be handled ina  ball class anyway
        }
    }

    onCollisionPlayerBall(ball, player) {

        // blow particles for fun
        let emitter = this.emitter;
        emitter.setPosition(ball.x,ball.y);
        emitter.emitParticle();
    }

    moveBall(key, x, y) {
        let ball = this.balls[key];
        ball.newx = x;
        ball.newy = y;
        //ball.x = x;
        //ball.y = y;
    }

    preload(){
    }


    update(){
        for(let ballKey in this.balls){
            let ball = this.balls[ballKey];
            ball.update();
        }

        for(let playerKey in Game.playerMap){
            let player = Game.playerMap[playerKey];
            player.update();
        }
    }

    addNewPlayer(id, character, x, y) {
        if (Game.playerMap[id]) {
            //
        } else {
            let selectedCharacter = character.toUpperCase();
            let newPlayer = new Player(this, this.characters[selectedCharacter], x, y);
            Game.playerMap[id]= newPlayer;

            newPlayer.newx = x;
            newPlayer.newy = y;

            newPlayer.update = function(){
                this.x = this.newx; //* 0.9 + this.newx * 0.1;
                this.y = this.newy; //* 0.9 + this.newy * 0.1;
                // this.x = this.x * 0.9 + this.newx * 0.1;
                // this.y = this.y * 0.9 + this.newy * 0.1;
            }
        }
    }

    movePlayer(id,x,y) {
        let player = Game.playerMap[id];
        player.move(x,y);
    }

    removePlayer(id) {;
        Game.playerMap[id].destroy();
        delete Game.playerMap[id];
    }
}

