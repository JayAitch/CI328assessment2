var systems = require('./systems.js');
var physObjects = require('./physics-objects.js');

const PORT = 55000;

var server = require('http').createServer();
global.io = require('socket.io')(server);
io = global.io;
var game;
let lobby = {}; //temp
lobby.members = {};

let ball;//temp
server.lastMemberID = 0;

server.lastPlayerID = 0;
// here for now as we only have one lobby
// only the collection needs to be up here in future

io.on('connection', function(client) {

    client.on('test', function() {
        console.log('test received');
    });



    client.on('joinlobby', function(){

        client.join('lobby'); // i think we can have a list of rooms
        client.member = {
            position: server.lastMemberID,
            isready: false,
            socketid : client.id
        }

        server.lastMemberID++;
        lobby.members[client.id] = client.member;

        // just the connecting client
        client.emit('alllobbymembers', lobby.members);

        // all lobby members that arnt the connecting client
        client.broadcast.to('lobby').emit('newmember', client.member);


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
                    game = new Game(lobby.members);
                    io.sockets.in('lobby').emit("loadgame");
                    lobby = {};
                    lobby.members = {};
                    server.lastMemberID = 0;

                }, 3000);
            };
        });
    });

    // this logic should now be done when the lobby ready trigger is caused
    // this also fixes a potential issue with the duplication of players
    // this encapsulating should be done through loadgame calls
    client.on('gameconnect', function() {

        client.player = game.players[client.id];
        let gameBall = game.balls[game.lastBallID];

        client.emit("newball", gameBall); // we may be able to contain this transisition inside a game object to parsel sockets together
        client.emit('allplayers', getAllPlayers()); // probably want this bundled as an init

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



function getAllPlayers(){
    var players = [];
    Object.keys(game.players).forEach(function(socketID){
        var player = game.players[socketID];//io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    // Object.keys(io.sockets.connected).forEach(function(socketID){
    //     console.log(io.sockets.connected[socketID].player);
    //     var player = io.sockets.connected[socketID].player;
    //     if(player) players.push(player);
    // });
    return players;
}

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

// class ServerTickUpdate{
//     constructor(io){
//         this.io = io;
//         this.balls = [];
//         this.player = []
//     }
//     addToBallUpdates(ball){
//         this.ball.push(ball);
//     }
//     addToPlayerupdates(player){
//         this.player.push(player);
//     }
//     updateClients(){
//         this.updateBallPosition();
//         this.updatePlayerPosition();
//     }
//     updateBallPosition(obj){
//         this.balls.forEach((obj) => {
//             this.io.emit("moveball", obj);
//         });
//     }
//
//     updatePlayerPosition(obj){
//         this.player.forEach((obj) => {
//             this.io.emit('move', obj);
//         });
//
//     }
// }

class Game {
    constructor(membersList){
        this.lastBallID = 0;
        this.players = {};
        this.goals = {};
        this.balls = {};
        this.collisionManager = new systems.CollisionManager();
        this.createPlayers(membersList);
        this.createBall();
        systems.addToUpdate(this);
    }

    destroyGame(){
        // remove this object from the updater
    }
    createPlayers(membersList){
        for(let memberkey in membersList){
            let member = membersList[memberkey];
            this.createPlayer(member);
        }
    }

    createPlayer(member){
        let startVectors = getStartVectors(member.position);
        let width = 190; //temp
        let height = 49; //temp
        let xPos = startVectors.x;
        let yPos = startVectors.y;
        let isRotated = this.getIsRotated(member.position)
        let newPlayer = new physObjects.Player(member.position, xPos , yPos, width, height, isRotated);
        this.players[member.socketid] = newPlayer;
        this.createGoal(member.position,xPos,yPos,isRotated);
    }

    createGoal(memberid, x, y, isRotated){
        let goalWidth = 1000;
        let goalHeight = 20;
        let newGoal = new physObjects.PlayerGoal(x, y, goalWidth, goalHeight, isRotated);
        this.goals[memberid] = newGoal;
    }

    createBall(){

        let ballWidth = 48;
        let newBall = new physObjects.Ball(physObjects.gameHeight/2, physObjects.gameWidth/2, ballWidth/2);
        newBall.setVelocity(10,0)
        this.balls[this.lastBallID] = newBall;
        this.addBallCollisions(newBall);
        this.lastBallID++;
    }

    addBallCollisions(ball){
        for(let playerKey in this.players) {
            let player = this.players[playerKey];
            this.collisionManager.addCollision(player, ball, () => { onCollisionPlayerBall(player, ball) });
        }
        for(let goalKey in this.goals) {
            let goal = this.goals[goalKey];
            this.collisionManager.addCollision(goal, ball, () => { goal.onCollision()});
        }
    }

    update(){
        this.updatePlayerPositions();
        this.updateBallPositions();
    }

    updateBallPositions(){
        for(let ballKey in this.balls) {
            let ball = this.balls[ballKey];
            ball.update();
        }
    }

    updatePlayerPositions(){
        for(let playerKey in this.players) {
            let player = this.players[playerKey];
            player.update();
        }
    }
    getIsRotated(playerNumber){
        return !(playerNumber % 2);
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