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

        Client.askNewPlayer();
        console.log("game started");
        // append methods to game object for client to interact with

       // Game.setPlayerChar = ((number) => {this.switchPlayerCharacter(number)});
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


    preload(){
        // this.load.image('sprite', 'assets/coin.png');
        // this.load.image('blue_paddleV', 'assets/blue_paddleV.png');
        // this.load.image('green_paddleV', 'assets/green_paddleV.png');
        // this.load.image('red_paddleV', 'assets/red_paddleV.png');
        // this.load.image('yellow_paddleV', 'assets/yellow_paddleV.png');
        // this.load.image('blue_paddleH', 'assets/blue_paddleH.png');
        // this.load.image('green_paddleH', 'assets/green_paddleH.png');
        // this.load.image('red_paddleH', 'assets/red_paddleH.png');
        // this.load.image('yellow_paddleH', 'assets/yellow_paddleH.png');
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
        var player = Game.playerMap[id];
        console.log(Phaser.Math);
        var distance = Phaser.Math.Distance.Between(player.x,player.y,x,y);
        var duration = distance * 10;
        var tween = this.add.tween(
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