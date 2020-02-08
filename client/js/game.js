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


       // this.input.onTap.add(Game.getCoordinates, this);

        Client.askNewPlayer();

        // append methods to game object for client to interact with
        Game.addNewPlayer = ((id,x,y)=>{this.addNewPlayer(id, x, y)})
        Game.movePlayer = ((id,x,y)=>{this.movePlayer(id, x, y)})
    }
    preload(){
        this.load.image('sprite', 'assets/coin.png');
    }

    getCoordinates(pointer){
        Client.sendClick(pointer.worldX,pointer.worldY);
    }


    addNewPlayer(id, x, y){
        Game.playerMap[id] = this.add.sprite(x,y,'sprite');
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