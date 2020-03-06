
const gameWidth = 800;
const gameHeight = 800;



const characters  = {
    "BIG": {speed:2, size: 304, lives: 4},
    "MEDIUM": {speed:4, size: 190, lives: 3},
    "SMALL": {speed:6, size: 114, lives: 4}
}



function createPoint(x, y){return {x: x, y: y};}

//https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection AABB
// generic physics object, adds itself to updater
// abstract
// we might want capacity to have trigger based collsions aswell
class PhysicsObject {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.velocity = createPoint(0,0);
        //Updater.addToUpdate(this);
    }

    onCollision(otherObject) {
    }

    intersects(a, b) {
        return false;
    }

    outside(a, b) {
        return false;
    }

    backstep() {
        this.x = this.previousX;
        this.y = this.previousY
    }
    
    update() {
        // apply velocity changes
        this.previousX = this.x;
        this.previousY = this.y;

        this.x = this.previousX + this.velocity.x;
        this.y = this.previousY + this.velocity.y;

    }
    //https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection AABB
    //https://www.sevenson.com.au/actionscript/sat/
    //https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
    isOutOfBounds() {
        return false;
    }

    isOverlapping(a, b) {
        return false;
    }

    setVelocity(x, y) {
        this.velocity = createPoint(x,y);
    }

    stop() {
        this.velocity = createPoint(0,0);
    }
}


class RectanglePhysicsObject extends PhysicsObject{
    constructor(x, y, width, height, checkBounds, onBoundsCollision) {
        super(x, y);
        this.width = width;
        this.height = height;
        if (checkBounds) {
            this.checkBounds = checkBounds;
            this.onBoundsCollision = onBoundsCollision;
        }
    }

    // this only detects rectangle with rectangle we should have a collision handling object instead to allow for cir - squ and cir-cir and sqr-sqr
    intersects(a, b) {
        return (a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y)
    }

    isOutOfBounds() {
        let lx = this.x;
        let ly = this.y;
        let halfWidth = this.width / 2;
        let halfHeight = this.height / 2;
        let outsideBounds = false;

        // check x
        if (lx - halfWidth <= 0) {
            this.lastBoundryCrossed = 0;
            outsideBounds = true;
            this.x += halfWidth;
		} else if (lx + halfWidth >= gameWidth) {
            this.lastBoundryCrossed = 2;
            outsideBounds = true;
            this.x -= halfWidth;
        }
        
        // check y
        if (ly - halfHeight <= 0) {
            this.lastBoundryCrossed = 1;
            outsideBounds = true;
            this.y += halfHeight;
		} else if (ly + halfHeight >= gameHeight) {
            this.lastBoundryCrossed = 3;
            outsideBounds = true;
            this.y -= halfHeight;
        }

        return outsideBounds;
    }

}

class Ball extends RectanglePhysicsObject {

    constructor(x, y, radius, checkBounds, onBoundsCollision) {
        super(x, y, radius, radius, checkBounds, onBoundsCollision);
    }

    //https://stackoverflow.com/questions/13455042/random-number-between-negative-and-positive-value
    onCollision(otherObject) {
        /*let xVel = this.velocity.x;
        let yVel = this.velocity.y;
        let newXVeloctity = xVel  * -1;
        let newYVeloctity = yVel * -1;

        if(otherObject){
            newXVeloctity = newXVeloctity + otherObject.velocity.x;
            newYVeloctity = newYVeloctity + otherObject.velocity.y;
        }

        this.setVelocity(newXVeloctity, newYVeloctity);*/
    }

    // JACK - bounce shiz
    // https://stackoverflow.com/questions/54559607/why-wont-the-balls-bounce-fully-in-my-pong-javascript-canvas-game/54561680#54561680
    bounce(angle, addedVelocityX, addedVelocityY) {
        let normal = this.calcNormalFromAngle(angle);
        let velocity = [this.velocity.x, this.velocity.y];
    
        let ul = this.dotproduct(velocity, normal) / this.dotproduct(normal, normal)
        let u = [
            normal[0] * ul,
            normal[1] * ul
        ]
        let w = [
            velocity[0] - u[0],
            velocity[1] - u[1]
        ]
        let new_velocity = [
            w[0] - u[0],
            w[1] - u[1]
        ]
    
        let maxV = 15;
        let v = [
            Math.min(maxV, addedVelocityX ? Math.round(new_velocity[0] + (addedVelocityX * .5)) : Math.round(new_velocity[0])),
            Math.min(maxV, addedVelocityY ? Math.round(new_velocity[1] + (addedVelocityY * .5)) : Math.round(new_velocity[1]))
        ];

        this.velocity.x = v[0];
        this.velocity.y = v[1];
        this.setVelocity(this.velocity.x, this.velocity.y);
    }
    
    calcNormalFromAngle(angle) {
        return [
            Math.cos(angle),
            Math.sin(angle)
        ]
    }
  
    dotproduct(a, b) {
        return a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n)
    }

    update() {
        if (this.checkBounds && this.isOutOfBounds()) {
                this.onBoundsCollision(this, this.lastBoundryCrossed);
        }
        super.update();
    }
}

// player class understands how to move and stop
class Player extends RectanglePhysicsObject{

    constructor(id, x, y, isRotated, characterID){

        let character = characters[characterID]
        let characterHeight = 49;
        let characterWidth = character.size;

        super(x, y, characterWidth, characterHeight);


        this.characterID = characterID;
        this.id = id;

        this.lives = character.lives;
        this.baseSpeed = character.speed;
        // changed to use aabb
        // this is actually wrong, we are setting this value twice
        if (isRotated) {
            this.width = characterHeight;
            this.height = characterWidth;
        } else {
            this.height = characterHeight;
            this.width = characterWidth;
        }
        this.moveDirection = this.getMoveDirection(isRotated);
    }



    move(input) {
        let moveSpeed = this.baseSpeed; // + modifiers??
        let xMovement = this.moveDirection.x * (moveSpeed * input);
        let yMovement = this.moveDirection.y * (moveSpeed * input);
        this.setVelocity(xMovement, yMovement);
    }

    stop() {
        this.setVelocity(0,0);
    }

    // something like this to restrict the amount of data being pushed down the wire
    getData() {
        return {
            id: this.id,
            playnumber: this.playNumber,
            x: this.pos.x,
            y: this.pos.y,
        };
    }

    update() {
        super.update();
        if (this.isOutOfBounds()) {
            this.backstep();
        }
    }

    // which direction does the player move in
    getMoveDirection(isRotated) {
        switch (isRotated) {
            case false:  return {x: 1, y: 0 }
            case true:  return {x: 0, y: 1 }
        }
    }

}

class PlayerGoal {
    constructor(x, y, width, height, isRotated) {
        this.x = x;
        this.y = y;
        if (isRotated) {
            this.width = height;
            this.height = width;
        } else {
            this.width = width;
            this.height = height;
        }
    }

    onCollision() {
        console.log("goal scored");
    }
}

// delliberately only exporting non 'abstract'
// width and height should be on same game class?
module.exports = {Player, Ball, PlayerGoal, gameHeight, gameWidth}