class Player {
  constructor(game, character, x, y) {
    let size = character.size;
    let eyes = character.eyes;
    this.game = game;
    let container = this.game.add.container(x, y);
    this.bodyContainer = container;
    // this.bodyContainer = new Phaser.GameObjects.Container(game,spawnX,spawnY);
    this.generateBody(size, this.isRotated(x, y));

    // this.previousX = 0;
    // this.previousY = 0
    // this.bodyGroup.incX(spawnX);
    // this.bodyGroup.incY(spawnY);
  }

  isRotated(x, y) {
    if (x < 300) return 90;
    if (x > 500) return -90;
    if (y < 300) return 180;
    return 0;
  }

  generateBody(size, rotation) {
    let xPos = 0;
    this.bodyContainer.add(this.game.add.sprite(xPos,0,'slimeEdge'));
    xPos += 38;
    for (let i = 0; i < size; i++) {
      this.bodyContainer.add(this.game.add.sprite(xPos,0,'slimeMiddle'));
      xPos += 38;
    }
    let edge = this.game.add.sprite(xPos,0,'slimeEdge')
    edge.scaleX = -1;
    this.bodyContainer.add(edge);
    this.bodyContainer.angle = rotation;
  }

  move(newX, newY) {
    this.bodyContainer.x = newX;
    this.bodyContainer.y = newY;

    // moveX = newX - this.previousX;
    // moveY = newY - this.previousY;
    // this.bodyGroup.incX(moveX);
    // this.bodyGroup.incY(moveY);
    // this.previousX = newX;
    // this.previousY = newY; 
  }
}