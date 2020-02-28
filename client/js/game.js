 var Game = {};
//
// Game.init = function(){
//     game.stage.disableVisibilityChange = true;
// };
//
// Game.preload = function() {
//     game.load.image('sprite', 'assets/coin.png');
// };
//
// Game.create = function(){
//     Game.playerMap = {};
//     var testKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
//     var leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
//     var rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
//
//     testKey.onDown.add(Client.sendTest, this);
//
//
//     leftKey.on('down', function(event) {
//         Client.sendMove(-1)
//     });
//
//     rightKey.on('down', function(event) {
//         Client.sendMove(1)
//     });
//
//
//     game.input.onTap.add(Game.getCoordinates, this);
//
//     Client.askNewPlayer();
// };
//
// Game.getCoordinates = function(pointer){
//     Client.sendClick(pointer.worldX,pointer.worldY);
// };
//
// Game.addNewPlayer = function(id,x,y){
//     Game.playerMap[id] = game.add.sprite(x,y,'sprite');
// };
//
// Game.movePlayer = function(id,x,y){
//     var player = Game.playerMap[id];
//     var distance = Phaser.Math.distance(player.x,player.y,x,y);
//     var tween = game.add.tween(player);
//     var duration = distance*10;
//     tween.to({x:x,y:y}, duration);
//     tween.start();
// };
//
// Game.removePlayer = function(id){
//     Game.playerMap[id].destroy();
//     delete Game.playerMap[id];
// };

class GameScene extends Phaser.Scene{
    constructor(){
        super({key: 'maingame'});
    }
    create(){
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
    }


    spawnBall(x,y){
        this.ball = this.add.sprite( x, y, "ball");
        this.ball.newx = x;
        this.ball.newy = y;
        this.ball.update = ()=> {
            let ball = this.ball;
            console.dir(ball);
            console.dir(this.ball);
            ball.x = ball.x * 0.9 + ball.newx * 0.1;
            ball.y = ball.y * 0.9 + ball.newy * 0.1;   
        }
    }

    moveBall(x, y){
        let ball = this.ball;
        ball.newx = x;
        ball.newy = y;
        //console.log(ball);
        
        // let distance = Phaser.Math.Distance.Between(ball.x,ball.y, x, y);
        // let duration = distance * 5;
        // let tween = this.add.tween(
        //     {
        //         targets: [ball],
        //         duration: duration,
        //         x: x,
        //         y : y
        //     });
    }

    getPlayerCharacter(id){
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

    update() {
        if(this.ball) this.ball.update()
    }

    getCoordinates(pointer){
        Client.sendClick(pointer.worldX,pointer.worldY);
    }


    addNewPlayer(id, x, y){
        if(Game.playerMap[id]){

        }else{
            Game.playerMap[id] = this.add.sprite(x,y,this.getPlayerCharacter(id));
        }

    }




    movePlayer (id,x,y){
        // tween player to server calculate player position
        let player = Game.playerMap[id];

        let distance = Phaser.Math.Distance.Between(player.x,player.y,x,y);
        let duration = distance * 5;
        let tween = this.add.tween(
            {
                targets: [player],
                duration: duration,
                x: x,
                y : y
            });
    }


    removePlayer(id){
        Game.playerMap[id].destroy();
        delete Game.playerMap[id];
    }
}