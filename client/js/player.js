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
    if (size == 0) {
      xPos = 19;
    } else if (size % 2 == 0 && size != 0) {
      let middleSprite = this.game.add.sprite(xPos,0,'slimeMiddle').setOrigin(0.5,0.5);
      this.bodyContainer.add(middleSprite);
      xPos = 38;
    }
    for (let i = 1; i < size/2; i++) {
      let rightSprite = this.game.add.sprite(xPos,0,'slimeMiddle').setOrigin(0.5,0.5);
      let leftSprite = this.game.add.sprite(xPos * -1,0,'slimeMiddle').setOrigin(0.5,0.5);
      this.bodyContainer.add(rightSprite);
      this.bodyContainer.add(leftSprite);
      xPos += 38;
    }
    this.bodyContainer.add(this.game.add.sprite(xPos * -1,0,'slimeEdge').setOrigin(0.5,0.5));
    let edge = this.game.add.sprite(xPos,0,'slimeEdge').setOrigin(0.5,0.5);
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