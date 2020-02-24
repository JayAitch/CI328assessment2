
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

    // this only detects rectangle with rectangle we should have a collision handling object instead to allow for cir - squ and cir-cir and sqr-sqr
    intersects(a, b) {
        return (a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y)
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

//  relivant interection logic https://jsfiddle.net/SalixAlba/54Fb2/
class CirclePhysicsObject extends PhysicsObject{
    constructor(x, y, radius) {
        super(x,y);
        this.radius = radius;
    }

    isOutOfBounds() {
        const radius = this.radius;
        let x = this.x;
        let y = this.y;
        return(x - radius < 0 ||
            x + radius > gameWidth ||
            y - radius < 0 ||
            y + radius > gameHeight
        )
    }
}

class Ball extends CirclePhysicsObject{
    constructor(x,y,radius){
        super(x,y,radius);
        let diameter = radius * 2;
        this.height = diameter;
        this.width = diameter;
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
        if(global.io)global.io.emit("moveball",this); // not here
    }
}

// player class understands how to move and stop
class Player extends RectanglePhysicsObject{

    constructor(id,playNumber ,x, y, width, height, isRotated){
        super(x, y, width, height);
        this.id = id;
        this.playNumber = playNumber;
        this.pos = {x:x,y:y}; // this value isnt being updates
        this.moveDirection = this.getMoveDirection();
        // changed to use aabb
        if(isRotated){
            this.width = height;
            this.height = width;
        }
        else {
            this.height = height;
            this.width = width;
        }


        this.isRotated = isRotated;
    }

    move(input){
        let moveDirection = this.moveDirection;//getMoveDirection(this.playNumber);
        let moveSpeed = 10;

        let xMovement = moveDirection.x * (moveSpeed * input);
        let yMovement = moveDirection.y * (moveSpeed * input);
        this.setVelocity(xMovement, yMovement);
    }


    stop(){
        this.setVelocity(0,0);
    }


    // something like this to restrict the amount of data being pushed down the wire
    getData(){
        let data = {
            id: this.id,
            playnumber: this.playNumber,
            x: this.pos.x,
            y: this.pos.y,
        }
        return data;
    }

    update() {
        super.update();
        // tell everyone the player has been updated - do this somewhere else
        if(global.io)global.io.emit('move', this);
    }

    // which direction does the player move in
    getMoveDirection(){
        // invert inputs for opersite players, restrict movement to 1 axis
        switch (this.playNumber) {
            case 0:   return {x: 0, y:1 }
            case 1:   return {x: 1, y:0 }
            case 2:   return {x: 0, y:-1 }
            case 3:   return {x: -1, y:0 }
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