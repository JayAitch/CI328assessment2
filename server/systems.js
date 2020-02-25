let updateTimeout;



function addToUpdate(obj){
    Updater.addToUpdate(obj);
}

function clearUpdater(){
    Updater.clearUpdater();
}

function startUpdate(){
    update();
}
function stopUpdate() {
    updateTimeout = null;
}
function update(){
    updateTimeout = setTimeout(function () {
        Updater.update();
        update();

    }, 50)
}



const Updater = {
    updateables:[],
    addToUpdate: function (object) {
        this.updateables.push(object);
    },
    // bodge for now to stop us needing to restart the server everytime
    clearUpdater: function(){
        this.updateables = [];
    },
    update: function () {
        for(let key in this.updateables){
            let object = this.updateables[key]
            object.update();
        }
    }
}



// JACK - testing collision manager
class CollisionManager {
    constructor(){
        this.colliders = [];
        Updater.addToUpdate(this)
    }

    addCollision(a, b, callback) {
        let collisionObject = {};
        collisionObject.objA = a;
        collisionObject.objB = b;
        collisionObject.onCollision = callback;

        this.colliders.push(collisionObject);
    }

    update() {
        this.colliders.forEach((obj) => {
            if (this.collides(obj.objA, obj.objB)) {
                //obj.objA.backstep();
                // obj.objB.backstep();
                obj.onCollision(obj.objB);
            }
        })
    }

    // not sure yet - circular
    collides (a, b) {
        if(a != undefined) {
            //return !(((a.y + a.height /2) < (b.y))|| (a.y > (b.y + b.height)) || ((a.x + a.width) < b.x) || (a.x > (b.x + b.width)));


            let aWidth = (a.radius || a.width) / 2;
            let bWidth = (b.radius || b.width) / 2;
            let aHeight  = (a.radius || a.height)/ 2;
            let bHeight = (b.radius || b.height)/ 2;


            return (a.x - aWidth < b.x + bWidth  &&
                a.x + aWidth > b.x - bWidth &&
                a.y - aHeight < b.y + bHeight &&
                a.y + aHeight > b.y - bHeight)


        }
    }

    // wedge this in somewhere to check if no longer overlapping - if needed
    /*
    // periodically check player is still overlapping exit
    checkOverlap(world.player, game.exit, function () {
        if (!game.objectiveComplete) {
            world.player.reachedExit = false;
        }
    });

    // recursive function to check overlap between 2 objects each frame - executes callback on separation
    checkOverlap(object1, object2, callback) {
        requestAnimationFrame(() => {
            var overlapping = game.physics.overlap(object1, object2);
            if (!overlapping) {
                callback();
            } else {
                checkOverlap(object1, object2, callback);
            }
        });
    }
    */
}
//maybe split into 2?
module.exports = {startUpdate, stopUpdate, addToUpdate, clearUpdater, CollisionManager};