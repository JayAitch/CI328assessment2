var systems = require('./systems.js');
var physObjects = require('./physics-objects.js');

const PORT = 55000;

var server = require('http').createServer();
global.io = require('socket.io')(server);
io = global.io;

// here for now as we only have one lobby
// only the collection needs to be up here in future

//physObjects.setIO(io)

io.on('connection', function(client) {

    // JACK - collision shizzz
    let collisionManager = {};
    collisionManager = new systems.CollisionManager();

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

    // this logic should now be done when the lobby ready trigger is caused
    // this also fixes a potential issue with the duplication of players
    // this encapsulating should be done through loadgame calls
    client.on('newplayer', function() {
        let playerNumber = server.lastPlayerID % 4;
        let startVectors = getStartVectors(playerNumber);

        let width = 190; //temp
        let height = 49; //temp

        client.player = new new physObjects.Player(
            playerNumber,
            startVectors.x,
            startVectors.y,
            width,
            height,
            isRotated(playerNumber));

        server.lastPlayerID++;
        systems.addToUpdate(client.player)

        if(!ball){
            // we want to have a game intiation method to call this stuff with
            ball = new physObjects.Ball( physObjects.gameHeight/2, physObjects.gameWidth/2, ballWidth/2)
            systems.addToUpdate(ball);
            ball.setVelocity(-8, 0)

            // this will contain a lot more information then we need
            io.emit("newball", ball); // we may be able to contain this transisition inside a game object to parsel sockets together
        }


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

        // JACK - collision shiz
        console.log('HEY', client.player, ball);
        collisionManager.addCollision(client.player, ball, () => { onCollisionPlayerBall(client.player, ball) })




        // testing a goal
        let goal = new physObjects.PlayerGoal(startVectors.x, startVectors.y, 1000, 10, isRotated(playerNumber));
        collisionManager.addCollision(goal, ball, () => { goal.onCollision()})    
    });
});

server.listen(PORT, function(){
    console.log('Listening on ' + server.address().port);
});

//create this somwhere else in the future
// i can see multiple lobbies being easy if this works
// we may want to run multiple servers, a lobby server and a game server would make the code significantly cleaner

let lobby = {}; //temp
lobby.members = {};

let ball;//temp
server.lastMemberID = 0;

server.lastPlayerID = 0;



function isRotated(playerNumber){
    return !(playerNumber % 2);
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

class ServerTickUpdate{
    constructor(io){
        this.io = io;
        this.balls = [];
        this.player = []
    }
    addToBallUpdates(ball){
        this.ball.push(ball);
    }
    addToPlayerupdates(player){
        this.player.push(player);
    }
    updateClients(){
        this.updateBallPosition();
        this.updatePlayerPosition();
    }
    updateBallPosition(obj){
        this.balls.forEach((obj) => {
            this.io.emit("moveball", obj);
        });
    }

    updatePlayerPosition(obj){
        this.player.forEach((obj) => {
            this.io.emit('move', obj);
        });

    }
}




// trigger update when it starts this will recall the update
// this should be done in the inards of a game class


// TBD -- add velocity from moving paddles
function onCollisionPlayerBall(player, ball) {
    ball.onCollision(player);
}

// get where the player should start
function getStartVectors(playnumber){
    const width = physObjects.gameWidth;
    const height = physObjects.gameHeight;
    const playerWidth = 30;
    const playerHeight = 30
    switch (playnumber) {
        case 0:   return {x: 0 + playerWidth, y: height/2}
        case 1:   return {x: width/2, y: height - playerHeight}
        case 2:   return {x: width - playerWidth, y: height/2}
        case 3:   return {x: width/2, y: 0 + playerHeight}
    }
}

systems.startUpdate();