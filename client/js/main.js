
const config = {
    type: Phaser.AUTO,
    width:800,
    height: 600,
    scene: [GameScene],
}

var game;
window.addEventListener('load', (event) => {
    game = new Phaser.Game(config);
});

