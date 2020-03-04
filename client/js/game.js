 var Game = {};

class GameScene extends Phaser.Scene {
    constructor() {
        super({key: 'maingame'});
    }

    create() {
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

        // this.input.onTap.add(Game.getCoordinates, this);
        Game.addNewPlayer = ((id,character, x,y)=>{this.addNewPlayer(id, character, x, y)})
        Game.movePlayer = ((id,x,y)=>{this.movePlayer(id, x, y)})
        Game.addNewBall = ((x,y)=>{this.spawnBall(x,y)}) // extend to allow multiple ball position updates (simularly to players)
        Game.moveBall = ((x,y) => {this.moveBall(x,y)}) // extend to allow multiple ball position updates (simularly to players)
        Client.askGameConnect();
        console.log("game started");
        // append methods to game object for client to interact with

        // Game.setPlayerChar = ((number) => {this.switchPlayerCharacter(number)});

        Game.onCollisionPlayerBall = ((ball, player) => {this.onCollisionPlayerBall(ball, player)});
        this.createEmitter();

        this.characters = {
            "BIG": {size: 8, eyes: 4, colour: 0x00ffff},
            "MEDIUM": {size: 3, eyes: 3, colour: 0xff0000},
            "SMALL": {size: 0, eyes: 4, colour: 0xffff00}
        }
    }

    spawnBall(x,y) {
        this.ball = this.add.sprite(x, y, "ball");
        this.ball.newx = x;
        this.ball.newy = y;
        this.ball.update = ()=> {
            let ball = this.ball;
            ball.x = ball.newx;// * 0.9 + ball.newx * 0.1;
            ball.y = ball.newy;// * 0.9 + ball.newy * 0.1;
            // ball.x = ball.x * 0.9 + ball.newx * 0.1;
            // ball.y = ball.y * 0.9 + ball.newy * 0.1;
        }
    }

    createEmitter(){
        let particles = this.add.particles('ball');
        particles.setDepth(2)
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

    onCollisionPlayerBall(ball, player) {

        // blow particles for fun
        let emitter = this.emitter;
        emitter.setPosition(ball.x,ball.y);
        emitter.emitParticle();
    }

    moveBall(x, y) {
        let ball = this.ball;
        ball.newx = x;
        ball.newy = y;
        //ball.x = x;
        //ball.y = y;
    }

    preload(){
    }


    update(){
        if(this.ball) this.ball.update();
        for(let playerKey in Game.playerMap){
            let player = Game.playerMap[playerKey];
            player.update();
        }
    }


    getCoordinates(pointer) {
        Client.sendClick(pointer.worldX, pointer.worldY);
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

    removePlayer(id) {
        Game.playerMap[id].destroy();
        delete Game.playerMap[id];
    }
}