
const gameWidth = 800;
const gameHeight = 800;





function createPoint(x, y){return {x: x, y: y};}

//https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection AABB
// generic physics object, adds itself to updater
// abstract
// we might want capacity to have trigger based collsions aswell
class PhysicsObject{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.velocity = createPoint(0,0)
        //Updater.addToUpdate(this);
    }

    onCollision(otherObject){
    }

    intersects(a, b){
        return false;
    }

    outside(a, b){
        return false;
    }

    backstep(){
        this.x = this.previousX;
        this.y = this.previousY
    }
    // apply velocity changes
    update(){

        this.previousX = this.x;
        this.previousY = this.y;
        this.x = this.previousX + this.velocity.x;
        this.y = this.previousY + this.velocity.y;
        // undo velocity changes if they have collided, client will not see this
        // TODO: need to create a collision handler
        //       need to create a circle based physics object
        if(this.isOutOfBounds()){ // do we move this to the collision manager???
            //  this.backstep();
            this.onCollision();
            // this.onCollision("bounds"); //temp
            //    this.x = previousX;
            //     this.y = previousY;
        }
    }
    //https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection AABB
    //https://www.sevenson.com.au/actionscript/sat/
    //https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
    isOutOfBounds(){
        return false;
    }
    isOverlapping(a, b){
        return false;
    }

    setVelocity(x, y){
        this.velocity = createPoint(x,y);
    }
    stop(){
        this.velocity = createPoint(0,0);
    }
}


class RectanglePhysicsObject extends PhysicsObject{
    constructor(x, y, width, height){
        super(x,y);
        this.width = width;
        this.height = height;
    }


    isOutOfBounds() {
        let hWidth = this.width / 2;
        let hHeight = this.height / 2;

        let lx = this.x;
        let ly = this.y;

        return (lx  - hWidth < 0 ||
            lx + hWidth > gameWidth ||
            ly - hHeight < 0 ||
            ly + hHeight > gameHeight
        )
    }

}

class Ball extends RectanglePhysicsObject{
    constructor(x,y, radius){
        super(x,y, radius, radius);
    }
//https://stackoverflow.com/questions/13455042/random-number-between-negative-and-positive-value
    onCollision(otherObject) {
        let xVel = this.velocity.x;
        let yVel = this.velocity.y;
        let newXVeloctity = xVel  * -1;
        let newYVeloctity = yVel * -1;

        if(otherObject){
            newXVeloctity = newXVeloctity + otherObject.velocity.x;
            newYVeloctity = newYVeloctity + otherObject.velocity.y;
        }

        this.setVelocity(newXVeloctity, newYVeloctity);
    }

    update() {
        super.update();
    }
}

// player class understands how to move and stop
class Player extends RectanglePhysicsObject{

    constructor(id, x, y, width, height, isRotated){
        super(x, y, width, height);
        this.id = id;
        this.pos = {x:x,y:y}; // this value isnt being updates
        // changed to use aabb
        if(isRotated){
            this.width = height;
            this.height = width;
        }
        else {
            this.height = height;
            this.width = width;
        }


        this.moveDirection = this.getMoveDirection(isRotated);
    }

    move(input){
        let moveSpeed = 10;

        let xMovement = this.moveDirection.x * (moveSpeed * input);
        let yMovement = this.moveDirection.y * (moveSpeed * input);
        this.setVelocity(xMovement, yMovement);
    }


    stop(){
        this.setVelocity(0,0);
    }


    // something like this to restrict the amount of data being pushed down the wire
    getData(){
        return {
          id: this.id,
          playnumber: this.playNumber,
          x: this.pos.x,
          y: this.pos.y,
      };
    }

    update() {
        super.update();
    }

    // which direction does the player move in
    getMoveDirection(isRotated){
      switch (isRotated) {
        case false:  return {x: 1, y:0 }
        case true:  return {x: 0, y:1 }
      }
    }

}

class PlayerGoal{
    constructor(x, y, width, height, isRotated){

        this.x = x;
        this.y = y;
        if(isRotated){
            this.width = height;
            this.height = width;
        }
        else{
            this.width = width;
            this.height = height;
        }

    }
    onCollision(){
        console.log("goal scored");
    }
}

// delliberately only exporting non 'abstract'
// width and height should be on same game class?
module.exports = {Player, Ball, PlayerGoal, gameHeight, gameWidth}