
const config = {
    type: Phaser.AUTO,
    width:800,
    height: 800,
    scene: [LandingScene,LobbySelectionScene, LobbyScene,GameScene],
}

var game;
var canvas; //temp
var canvasContext;
window.addEventListener('load', (event) => {
    game = new Phaser.Game(config);
    canvas = game.canvas;//temp
    canvasContext = canvas.getContext('2d');
});

//temp: invert canvas to make the player being played at the bottom
// this will break click events as the location of clicks doesnt change!!!!
function rotateCanvas(playerNumber){
    canvas.style = "transform: rotate(" + (playerNumber - 1) * 90 + "deg)";
}
