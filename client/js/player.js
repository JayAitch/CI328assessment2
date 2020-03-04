class Player {
  constructor(game, character, x, y) {
    let size = character.size;
    let eyes = character.eyes;
    let colour = character.colour;
    this.game = game;
    let bodyContainer = this.game.add.container(x, y);
    this.bodyContainer = bodyContainer;
    let eyeContainter = this.game.add.container(0,0);
    this.eyeContainter = eyeContainter;
    let socketContainer = this.game.add.container(0,0);
    this.socketContainer = socketContainer;
    this.generateBody(size, eyes, colour, this.isRotated(x, y));

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

  generateBody(size, eyes, colour, rotation) {
    let xPos = this.placeSprites(size, 38, 0, 'slimeMiddle', this.bodyContainer, colour);
    let leftEdge = this.game.add.sprite(xPos * -1,0,'slimeEdge').setOrigin(0.5,0.5);
    leftEdge.tint = colour;
    this.bodyContainer.add(leftEdge);
    let rightEdge = this.game.add.sprite(xPos,0,'slimeEdge').setOrigin(0.5,0.5);
    rightEdge.scaleX = -1;
    rightEdge.tint = colour;
    this.bodyContainer.add(rightEdge);
    this.placeSprites(eyes, 32, -20, 'eye', this.eyeContainter);
    this.placeSprites(eyes, 32, -20, 'socket', this.socketContainer, colour);
    this.bodyContainer.add(this.eyeContainter);
    this.bodyContainer.add(this.socketContainer);
    this.socketContainer.each(this.toggleEyes, '', true);
    this.bodyContainer.angle = rotation;
  }

  toggleEyes(socket, shouldOpen) {
    shouldOpen ? socket.setFrame('SocketOpen') : socket.setFrame('SocketClosed');
  }

  placeSprites(spriteCount, widthOffset, heightOffset, sprite, container, colour = null) {
    let xPos = widthOffset/2;
    if (spriteCount == 0) {
    } else if (spriteCount % 2 == 1 && spriteCount != 0) {
      xPos = 0;
      let middleSprite = this.game.add.sprite(xPos, heightOffset, sprite).setOrigin(0.5,0.5);
      if (colour != null) middleSprite.tint = colour;
      container.add(middleSprite);
      xPos = widthOffset;
      spriteCount --;
    }
    for (let i = 0; i < spriteCount/2; i++) {
      let rightSprite = this.game.add.sprite(xPos, heightOffset, sprite).setOrigin(0.5,0.5);
      let leftSprite = this.game.add.sprite(xPos * -1, heightOffset, sprite).setOrigin(0.5,0.5);
      if (colour != null) rightSprite.tint = colour;
      if (colour != null) leftSprite.tint = colour;
      container.add(rightSprite);
      container.add(leftSprite);
      xPos += widthOffset;
    }
    return xPos;
  }

  move(newX, newY) {
    this.bodyContainer.x = newX;
    this.bodyContainer.y = newY;
  }
}