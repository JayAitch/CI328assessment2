const PORT = 55000;

var server = require('http').createServer();
var io = require('socket.io')(server);

// here for now as we only have one lobby
// only the collection needs to be up here in future



io.on('connection', function(client) {

    client.on('test', function() {
        console.log('test received');
    });



    client.on('joinlobby', function(){

        client.join('lobby'); // i think we can have a list of rooms
        client.member = {
            position: server.lastMemberID++,
            isready: false,
            socketid : client.id
        }


        lobby.members[client.id] = client.member;

        client.emit('alllobbymembers', lobby.members);

        // this is currrently broadcasting to everything
        client.broadcast.emit('newmember', client.member);


        client.on('changecharacter',function(data) {
            //todo: change the character

            // tell everyone in the lobby the player has changed
            // this should probably be only the people in the lobby
            client.broadcast.emit('characterchange', client.player);
        });


        client.on('playerreadytoggle', function(data){
            console.log('playerreadytoggle');
            let clientId = client.id;
            let isReady = !client.member.isready

            lobby.members[clientId].isready = isReady;

            let isLobbyReady = true;
          //  io.sockets.to('lobby').emit('playerready', {key: clientId, isready: isReady});

            io.sockets.in('lobby').emit('playerready', {key: clientId, isready: isReady});

            // go through and make sure everyone is ready
            for(let key in lobby.members){
                // some seriouse jank, deffo move to ood
                if(!lobby.members[key].isready){
                    isLobbyReady = false;
                }
            }

            // if they are all ready clear the lobby and trigger game load
            if(isLobbyReady){
                setTimeout( function () {
                    io.sockets.in('lobby').emit("loadgame");
                    lobby = {};
                    lobby.members = {};
                }, 3000);
            };
        });
    });




    // client.on('triggerload', function(data){
    //     console.log("triggering loading");
    //     // we dont care about the order this happens so we dont need to broadcast - maybe we do who knows
    //     // there might be a way of doing this more cleanly by maintaining a list of sockets
    //     for(let key in lobby.members){
    //         let member = lobby.members[key]
    //         //if (member.hasOwnProperty(socketid)){
    //         io.sockets.to(member.socketid).emit("loadgame");
    //         // }
    //     }
    // });
    //



    // this logic should now be done when the lobby ready trigger is caused
    // this also fixes a potential issue with the duplication of players
    // this encapsulating should be done through loadgame calls
    client.on('newplayer', function() {
        let playerNumber = server.lastPlayerID % 4;
        let startVectors = getStartVectors(playerNumber);


        let width = 190; //temp
        let height = 49; //temp

        client.player = new Player(server.lastPlayerID++,
            playerNumber,
            startVectors.x,
            startVectors.y,
            width,
            height,
            isRotated(playerNumber));


        client.emit('allplayers', getAllPlayers());

        // called on all clients except the socket this thread is in
        client.broadcast.emit('newplayer', client.player);


        client.on('stopmove',function(data) {
            client.player.stop();
        });


        // we will want to write out own update mechanic, this will allow us to check for collisions after moving and combine movement of player/ball logic
        client.on('move',function(data) {
            let direction = Math.sign(data.direction);
            client.player.move(direction);
        });


        client.on('click',function(data) {
            console.log('click to '+data.x+', '+data.y);
            client.player.x = data.x;
            client.player.y = data.y;
            io.emit('move',client.player);
        });

        client.on('disconnect',function() {
            io.emit('remove', client.player.id);
            console.log('disconnecting: ' + client.player.id);
        });
    });
    
});

server.listen(PORT, function(){
    console.log('Listening on ' + server.address().port);
});

//create this somwhere else in the future
// i can see multiple lobbies being easy if this works
// we may want to run multiple servers, a lobby server and a game server would make the code significantly cleaner

var lobby = {};
lobby.members = {};


server.lastMemberID = 0;

server.lastPlayerID = 0;



function isRotated(playerNumber){
    return !playerNumber % 2;
}

function formPlayers(members){
    // create a player for each member
    // add them to the client object?? for instancing
    // get stats from lobby like position and character to create player objects
    // return
}

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        console.log(io.sockets.connected[socketID].player);
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}










function createPoint(x,y){
    return {x: x, y:y};
}

// this should probably be inside a physics object
// let the ball override so that it can be a circle
// this version is probably for the player only
function createBounds(position, width, height, isRotated){

    let topLeft, topRight, bottomLeft, bottomRight


    // bounds on a rotated paddle use the width as the height
    // if(isRotated){
    //     topLeft = position;
    //     topRight = createPoint(position.x + height, position.y);
    //     bottomLeft = createPoint(position.x, position.y + width);
    //     bottomRight = createPoint(position.x + height, position.y + width);
    // }
    // else{
    //     topLeft = position;
    //     topRight = createPoint(position.x + width, position.y);
    //     bottomLeft = createPoint(position.x, position.y + height);
    //     bottomRight = createPoint(position.x + width, position.y + height);
    // }
    //oops
    if(isRotated){
        topLeft = createPoint(position.x - (height / 2), position.y - (width / 2));
        topRight = createPoint(position.x + (height /2), position.y);
        bottomLeft = createPoint(position.x, position.y + (width/2));
        bottomRight = createPoint(position.x + height, position.y + (width/2));
    }
    else{
        topLeft = createPoint(position.x + (height / 2), position.y + (width / 2));;
        topRight = createPoint(position.x + (width/2), position.y);
        bottomLeft = createPoint(position.x, position.y + (height /2));
        bottomRight = createPoint(position.x + (width/2), position.y + (height /2));
    }

    let bounds = {topLeft:topLeft, topRight:topRight, bottomLeft:bottomLeft, bottomRight:bottomRight};
    return bounds;
}

const gameWidth = 800;
const gameHeight = 800;
const gameBounds = {
    topLeft: createPoint(0,0),
    topRight: createPoint(gameWidth, 0),
    bottomLeft: createPoint(0, gameHeight),
    bottomRight: createPoint(gameWidth,gameHeight)
}
// get where the player should start
function getStartVectors(playnumber){
    const width = gameWidth;
    const height = gameHeight;
    const playerWidth = 30;
    const playerHeight = 30
    switch (playnumber) {
        case 0:   return {x: 0 + playerWidth, y: height/2}
        case 1:   return {x: width/2, y: height - playerHeight}
        case 2:   return {x: width - playerWidth, y: height/2}
        case 3:   return {x: width/2, y: 0 + playerHeight}
    }
}

// which direction does the player move in
function getMoveDirection(playerNumber){
    // invert inputs for opersite players, restrict movement to 1 axis
    switch (playerNumber) {
        case 0:   return {x: 0, y:1 }
        case 1:   return {x: 1, y:0 }
        case 2:   return {x: 0, y:-1 }
        case 3:   return {x: -1, y:0 }
    }
}

//https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection AABB
// generic physics object, adds itself to updater
class PhysicsObject{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.velocity = createPoint(0,0)
        Updater.addToUpdate(this);
    }

    getBounds(){
    }

    intersects(a, b){
        console.log();
        return (a.x <= b.x && a.x >= b.x) &&
            (a.y <= b.y && a.y >= b.y);
    }

    outside(a, b){
        return !this.intersects(a,b);
    }


    // apply velocity changes
    update(){
        let previousX = this.x;
        let previousY = this.y;
        this.x = previousX + this.velocity.x;
        this.y = previousY + this.velocity.y;
        console.log(this.getBounds());
        console.log(gameBounds);
        if(this.isOutOfBounds()){
            console.log("outofbound");

         //   this.x = previousX;
          //  this.y = previousY;
        }
    }

    isOutOfBounds(){
        let bounds = this.getBounds();
        let isOutOfBounds = false;
        for(let thisBoundsKey in bounds){
            if(isOutOfBounds) return isOutOfBounds;
            let thisBound = bounds[thisBoundsKey];

            for(let gameBoundsKey in gameBounds){
                let gameBound = gameBounds[gameBoundsKey];
                isOutOfBounds = this.intersects(thisBound, gameBound);
            }
        };
        return isOutOfBounds;

    }

    // simple - wrong somewhere
    isOverlapping(a, b){
        let aBounds = a.getBounds();
        let bBounds = b.getBounds();
        let isOverLapping = false;
        for(let aBoundsKey in aBounds){
            if(isOverLapping) return isOverLapping;

            let aBound = bounds[aBoundsKey];
            for(let bBoundsKey in bBounds){
                let bBound = bBounds[bBoundsKey];
                isOverLapping = this.intersects(aBound, bBound);
            }
        };
    }

    setVelocity(x, y){
        this.velocity = createPoint(x,y);
    }
    stop(){
        this.velocity = createPoint(0,0);
    }
}

class Ball extends PhysicsObject{

}

// player class understands how to move and stop
class Player extends PhysicsObject{

    constructor(id,playNumber ,x, y, width, height, isRotated){
        super(x, y);
        this.id = id;
        this.playNumber = playNumber;
        this.pos = {x:x,y:y}; // this value isnt being updates
        this.width = width;
        this.height = height;
        this.isRotated = isRotated;
    }

    move(input){
        let moveDirection = getMoveDirection(this.playNumber);
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
    // we can do bounds like this now
    getBounds() {
        //super.getBounds();
        return createBounds({x:this.x,y:this.y}, this.width, this.height, this.isRotated);
    }
    update() {
        super.update();
        // tell everyone the player has been updated
        io.emit('move', this);
    }
}


const Updater = {
    updateables:[],
    addToUpdate: function (object) {
        this.updateables.push(object);
    },
    update: function () {
        console.log("update tick");
        for(let key in this.updateables){
            let object = this.updateables[key]
            object.update();
        }
    }
}


// trigger update when it starts this will recall the update
// this should be done in the inards of a game class
update();
function update(){
    setTimeout(function () {
        Updater.update();
        update();
    }, 100)
}