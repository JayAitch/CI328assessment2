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
        Game.addNewPlayer = ((id,x,y)=>{this.addNewPlayer(id, x, y)})
        Game.movePlayer = ((id,x,y)=>{this.movePlayer(id, x, y)})
        Game.addNewBall = ((x,y)=>{this.spawnBall(x,y)}) // extend to allow multiple ball position updates (simularly to players)
        Game.moveBall = ((x,y) => {this.moveBall(x,y)}) // extend to allow multiple ball position updates (simularly to players)
        Client.askGameConnect();
        console.log("game started");
        // append methods to game object for client to interact with

        // Game.setPlayerChar = ((number) => {this.switchPlayerCharacter(number)});

        Game.onCollisionPlayerBall = ((ball, player) => {this.onCollisionPlayerBall(ball, player)});
        this.createEmitter();
    }

    spawnBall(x,y) {
        this.ball = this.add.sprite(x, y, "ball");
        this.ball.newx = x;
        this.ball.newy = y;
        /*this.ball.update = ()=> {
            let ball = this.ball;
            ball.x = ball.x * 0.9 + ball.newx * 0.1;
            ball.y = ball.y * 0.9 + ball.newy * 0.1;
        }*/
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
        ball.x = x;
        ball.y = y;
    }

    getPlayerCharacter(id) {
      let playerNumber = id % 4;
        switch(playerNumber){
            case 0:
                return 'blue_paddleV'
            case 1:
                return 'green_paddleH' 
            case 2:
                return 'red_paddleV'
            case 3:
                return 'yellow_paddleH'
        }
    }

    preload(){
    }

    getCoordinates(pointer) {
        Client.sendClick(pointer.worldX, pointer.worldY);
    }

    addNewPlayer(id, x, y) {
        if (Game.playerMap[id]) {
            //
        } else {
            Game.playerMap[id] = this.add.sprite(x,y,this.getPlayerCharacter(id));
        }

    }

    movePlayer(id,x,y) {
        // tween player to server calculate player position
        let player = Game.playerMap[id];

        let distance = Phaser.Math.Distance.Between(player.x, player.y, x, y);
        let duration = distance * 5;
        let tween = this.add.tween(
            {
                targets: [player],
                duration: duration,
                x: x,
                y : y
            }
        );
    }

    removePlayer(id) {
        Game.playerMap[id].destroy();
        delete Game.playerMap[id];
    }
}