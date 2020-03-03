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

const characters  = {
    "BIG": {speed:2, size: 400, lives: 4},
    "MEDIUM": {speed:4, size: 190, lives: 3},
    "SMALL": {speed:6, size: 50, lives: 4}
}

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
                socketid : client.id,
                character : "BIG"
            }

            server.lastMemberID++;
            lobby.members[client.id] = client.member;

            // just the connecting client
            client.emit('alllobbymembers', lobby.members);

            // all lobby members that arnt the connecting client
            client.broadcast.to('lobby').emit('newmember', client.member);


            client.on('changecharacter',function(data) {
                //todo: change the character
                client.member.character = data.character;
                console.log(client.member);
                // tell everyone in the lobby the player has changed
                // this should probably be only the people in the lobby
                io.sockets.in('lobby').emit('characterchange', {key:client.id, character: client.member.character});
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
                        if(game){
                            game.destroyGame();
                        }
                        // creating lobbies and multiple games should be easy now the game is handling where the updates go!
                        game = new Game(lobby.members, 'lobby');
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


class Game {
    constructor(membersList, gameid){
        this.players = {};
        this.goals = {};
        this.balls = {};
        this.gameid = gameid;
        this.collisionManager = new systems.CollisionManager();
        this.createPlayers(membersList);
        this.createBall();
        systems.addToUpdate(this);
    }

    destroyGame(){
        // remove this object from the updater
        // bodge for now to stop us needing to restart the server everytime
        systems.clearUpdater();
    }

    createPlayers(membersList){
        for(let memberkey in membersList){
            let member = membersList[memberkey];
            this.createPlayer(member);
        }
    }

    createPlayer(member){
        let character = characters[member.character]
        let startVectors = this.getStartVectors(member.position);
        let width = character.size//190; //temp
        let baseLives = character.lives;
        let baseSpeed = character.speed;
        let height = 49; //temp
        let xPos = startVectors.x;
        let yPos = startVectors.y;
        let isRotated = this.getIsRotated(member.position)
        let newPlayer = new physObjects.Player(member.position, xPos , yPos, width, height, isRotated, baseLives, baseSpeed);
        this.players[member.socketid] = newPlayer;
        this.createGoal(member.position,xPos,yPos,isRotated);
    }

    createGoal(memberid, x, y, isRotated){
        let goalWidth = 1000;
        let goalHeight = 20;
        // goal can probably keep track of lives
        let newGoal = new physObjects.PlayerGoal(x, y, goalWidth, goalHeight, isRotated);
        this.goals[memberid] = newGoal;
    }

    createBall(){
        this.lastBallID++;
        let ballWidth = 48;
        let newBall = new physObjects.Ball(physObjects.gameHeight/2, physObjects.gameWidth/2, ballWidth/2, true, (ball, bounds)=> { this.onCollisionBallBounds(ball, bounds)});
        newBall.setVelocity(5,0)
        this.balls[this.lastBallID] = newBall;
        this.addBallCollisions(newBall);

    }

    addBallCollisions(ball){
        for(let playerKey in this.players) {
            let player = this.players[playerKey];
            this.collisionManager.addCollision(player, ball, () => { this.onCollisionPlayerBall(player, ball) });
        }
        for(let goalKey in this.goals) {
            let goal = this.goals[goalKey];
            this.collisionManager.addCollision(goal, ball, () => { this.onCollisionGoalBall(goal, ball)});
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
            //long term we dont need global update
            global.io.sockets.in(this.gameid).emit('moveball', ball);
        }
    }

    updatePlayerPositions(){
        for(let playerKey in this.players) {
            let player = this.players[playerKey];
            player.update();
            //long term we dont need global update
            global.io.sockets.in(this.gameid).emit('move', player);
        }
    }

    getIsRotated(playerNumber){
        return !(playerNumber % 2);
    }

    // get where the player should start
    getStartVectors(playerNumber){
        const width = physObjects.gameWidth;
        const height = physObjects.gameHeight;
        const playerWidth = 30;
        const playerHeight = 30
        switch (playerNumber) {
            case 0:   return {x: 0 + playerWidth, y: height/2}
            case 1:   return {x: width/2, y: height - playerHeight}
            case 2:   return {x: width - playerWidth, y: height/2}
            case 3:   return {x: width/2, y: 0 + playerHeight}
        }
    }

    onCollisionPlayerBall(player, ball) {
        // emit this shit for game to know where collision occurred, well, where the ball was when it did
        global.io.sockets.in(this.gameid).emit('collisionplayer', {player: player, ball: ball});

        let playerWidth = player.width / 2;
        let playerHeight = player.height / 2;
        let ballWidth = ball.width / 2;
        let ballHeight = ball.height / 2;

        let bound;
        if (ball.x > player.x + playerWidth) {
            bound = 0; // east of player - bounce right
            ball.x += ballWidth;
        } else if (ball.x < player.x - playerWidth) {
            bound = 2; // west of player - bounce left
            ball.x -= ballWidth;
        }
        
        if (ball.y > player.y + playerHeight) {
            bound = 1; // south of player - bounce down
            ball.y += ballHeight;
        } else if (ball.y < player.y - playerHeight) {
            bound = 3; // north of player - bounce up
            ball.y -= ballHeight;
        }

        let angle = this.getAngleFromBounds(bound);
        ball.bounce(angle, player.velocity.x, player.velocity.y);
    }

    onCollisionGoalBall(goal, ball) {
        // goal.onCollision();
    }

    onCollisionBallBounds(ball, bounds) {
        let angle = this.getAngleFromBounds(bounds);

        ball.bounce(angle);
    }

    getAngleFromBounds(bounds) {
        let angle;
        switch (bounds) {
            case 0:
                angle = Math.PI; // east of bound - (x+)
                break;
            case 1:
                angle = Math.PI / 2; // south of bound - (y+)
                break;
            case 2:
                angle = 0; // west of bound - (x-)
                break;
            case 3:
                angle = -Math.PI / 2; // north of bound - (y-)
                break;
        
            default:
                angle = 0; // might need better default
                break;
        }
        return angle;
    }

    sendUpdateMessage(){

    }
}


// trigger update when it starts this will recall the update
// this should be done in the inards of a game class




systems.startUpdate();