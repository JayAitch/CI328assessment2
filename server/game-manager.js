
var systems = require('./systems.js');
var physObjects = require('./physics-objects.js');
let maxBalls = 5;


function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function createManager(){
    systems.startUpdate();
}

function createNewGame(lobby){
    return GameManager.createGame(lobby);
}
function getCentreY(){
    return physObjects.gameHeight / 2;
}

function getCentreX(){
    return physObjects.gameWidth / 2;
}

const GameManager = {
    games: {},
     createGame: function(lobby){

        let position = lobby.id + Object.keys(this.games);
        let newGame = new Game(lobby);
        this.games[position] = newGame;
        return newGame;
    }
};

class Game {
    constructor(lobby){
        this.players = {};
        this.goals = {};
        this.balls = {};
        this.posts = {};
        this.gameid = lobby.id;
        this.lastBallID = 0;
        this.collisionManager = new systems.CollisionManager();
        this.createPosts();
        this.createPlayers(lobby.members);
        this.createBall();
        this.updaterID = systems.addToUpdate(this);

        this.spawnPowerUpTimer();
    }

    spawnPowerUpTimer(){

        let timerMax = 15000;
        let timerMin = 25000;
        let timeTrigger = randomInt(timerMax, timerMin);
        this.powerUpSpawnTimer = setTimeout(()=>{
            this.createPowerUp();
        }, timeTrigger);
    }


    createPlayers(membersList){
        for(let memberkey in membersList){
            let member = membersList[memberkey];
            this.createPlayer(member);
        }
    }

    createPlayer(member){
        let startVectors = this.getStartVectors(member.position);
        let xPos = startVectors.x;
        let yPos = startVectors.y;
        let isRotated = this.getIsRotated(member.position);
        let newPlayer = new physObjects.Player(member.position, xPos , yPos, isRotated, member.character, member.socketid);
        this.players[member.position] = newPlayer;
        this.createGoal(newPlayer, xPos, yPos, isRotated);

        // add player collision with nearest posts
        let nearestPosts = [];
        let gameCenter = {
            x: getCentreX(),
            y: getCentreY(),
            width: newPlayer.width,
            height: newPlayer.height
        };
        let bound = this.getBoundsFromPositions(newPlayer, gameCenter, false);
        switch (bound) {
            case 2:
                nearestPosts.push(this.posts[0]);
                nearestPosts.push(this.posts[3]);
                
                break;
            case 3:
                nearestPosts.push(this.posts[0]);
                nearestPosts.push(this.posts[1]);
                
                break;
            case 0:
                nearestPosts.push(this.posts[1]);
                nearestPosts.push(this.posts[2]);
                
                break;
            case 1:
                nearestPosts.push(this.posts[3]);
                nearestPosts.push(this.posts[2]);
                
                break;
        }

        nearestPosts.forEach((post)=> {
            this.collisionManager.addCollision(newPlayer, post, () => { this.onCollisionPlayerPost(newPlayer, post) });
        });
        
    }

    createGoal(player, x, y, isRotated){
        let goalWidth = 1000;
        let goalHeight = 20;
        let newGoal = new physObjects.PlayerGoal(x, y, goalWidth, goalHeight, isRotated, player);
        this.goals[player.id] = newGoal;
    }

    createPosts() {
        let size = 100;
        let postWidth = size / 2;
        let postHeight = size / 2;
        let positions = [
            { x: 0 + postWidth, y: 0 + postHeight },
            { x: physObjects.gameWidth - postWidth, y: 0 + postHeight },
            { x: physObjects.gameWidth - postWidth, y: physObjects.gameHeight - postHeight },
            { x: 0 + postWidth, y: physObjects.gameHeight - postHeight }
        ];

        for(let i = 0; i < positions.length; i++) {
            let post = positions[i];
            let newPost = new physObjects.RectanglePhysicsObject(post.x, post.y, size, size);
            this.posts[i] = newPost;
        }
    }

    createBall(){

        if(this.lastBallID >= maxBalls){
            return;
        }
        let ballWidth = 48;
        let newBall = new physObjects.Ball(
            getCentreX(),
            getCentreY(),
            ballWidth/2,
            true,
            (ball, bounds)=> { this.onCollisionBallBounds(ball, bounds)
            });

        this.resetBallPosition(newBall);
        this.balls[this.lastBallID] = newBall;



        this.addBallCollisions(newBall, this.lastBallID);
        this.newBallMessage(this.lastBallID, newBall);
        this.lastBallID++;
        return newBall;
    }

    createPowerUp(){

        let spawnAreaHeight = physObjects.gameHeight /2;
        let spawnAreaWidth = physObjects.gameWidth /2;
        let gameCentreY = getCentreY();
        let gameCentreX = getCentreX();


        let spawnAreaMaxY = gameCentreY + spawnAreaHeight / 2;
        let spawnAreaMinY = gameCentreY - spawnAreaHeight / 2;
        let spawnAreaMaxX = gameCentreX + spawnAreaWidth /2;
        let spawnAreaMinX = gameCentreX  - spawnAreaWidth /2;

        let spawnPosX = randomInt(spawnAreaMinX, spawnAreaMaxX);
        let spawnPosY = randomInt(spawnAreaMinY, spawnAreaMaxY);

        this.powerUp = new physObjects.PowerUp(spawnPosX, spawnPosY);
        this.powerUp.powerUpEffect = () => {this.createBall()};

        for(let ballKey in this.balls){

            let ball = this.balls[ballKey];
            this.collisionManager.addCollision(this.powerUp, ball, () => { this.onCollisionBallPowerup(this.powerUp, ball)});
        }
        global.io.sockets.in(this.gameid).emit('spawnpowerup', {x: this.powerUp.x, y:this.powerUp.y});
    }




    addBallCollisions(ball, id){
        for(let playerKey in this.players) {
            let player = this.players[playerKey];
            this.collisionManager.addCollision(player, ball, () => { this.onCollisionPlayerBall(player, ball) });
        }
        for(let goalKey in this.goals) {
            let goal = this.goals[goalKey];
            this.collisionManager.addCollision(goal, ball, () => { this.onCollisionGoalBall(goal, ball);});
        }
        for(let postKey in this.posts) {
            let post = this.posts[postKey];
            this.collisionManager.addCollision(post, ball, () => { this.onCollisionPostBall(post, ball)});
        }

        for(let ballKey in this.balls){
            // only on other balls
            if(ballKey != id){
                let oldBall = this.balls[ballKey];
                this.collisionManager.addCollision(ball, oldBall, () => { this.onCollisionBallBall(ball, oldBall)});
            }
        }
    }

    update(){
        this.updatePlayerPositions();
        this.updateBallPositions();
        
        this.collisionManager.update();
    }

    updateBallPositions(){
        for(let ballKey in this.balls) {
            let ball = this.balls[ballKey];
            ball.update();
            let data = {key:ballKey, x:ball.x, y:ball.y};
            global.io.sockets.in(this.gameid).emit('moveball', data);
        }
    }

    newBallMessage(key, ball){
        let data = {key:key, x:ball.x, y:ball.y };
        global.io.sockets.in(this.gameid).emit('newball', data);
    }

    updatePlayerPositions(){
        for(let playerKey in this.players) {
            let player = this.players[playerKey];
            player.update();
            global.io.sockets.in(this.gameid).emit('move', player);
        }
    }

    getIsRotated(playerNumber){

        switch (playerNumber) {
            case 0: return true;
            case 1: return true;
            case 2: return false;
            case 3: return false;
        }
    }

    // get where the player should start
    getStartVectors(playerNumber){
        const width = physObjects.gameWidth;
        const height = physObjects.gameHeight;
        const playerOffset = 50;

        switch (playerNumber) {
            case 0:   return {x: 0 + playerOffset, y: height/2};
            case 1:   return {x: width - playerOffset, y: height/2};
            case 2:   return {x: width/2, y: height - playerOffset};
            case 3:   return {x: width/2, y: 0 + playerOffset};
        }
    }

    killPlayer(player){
        player.isActive = false;
        delete this.players[player.id];
        delete this.goals[player.id];
        global.io.sockets.in(this.gameid).emit('playerdeath', {id:player.id});
    }

    getBoundsFromPositions(checkObj, boundObj, affectObj)  {
        // experimental function -  meant for ball, and will affect checkObj xy if affectObj is true - gross
        let boundObjWidth = boundObj.width / 2;
        let boundObjHeight = boundObj.height / 2;
        let checkObjWidth = checkObj.width / 2;
        let checkObjHeight = checkObj.height / 2;

        let bound;
        if (checkObj.x > boundObj.x + boundObjWidth) {
            bound = 0; // east of boundObj - bounce right
            if (affectObj) checkObj.x += checkObjWidth;
        } else if (checkObj.x < boundObj.x - boundObjWidth) {
            bound = 2; // west of boundObj - bounce left
            if (affectObj) checkObj.x -= checkObjWidth;
        }

        if (checkObj.y > boundObj.y + boundObjHeight) {
            bound = 1; // south of boundObj - bounce down
            if (affectObj) checkObj.y += checkObjHeight;
        } else if (checkObj.y < boundObj.y - boundObjHeight) {
            bound = 3; // north of boundObj - bounce up
            if (affectObj) checkObj.y -= checkObjHeight;
        }

        return bound;
    }

    onCollisionPostBall(post, ball) {
        // left this in for something else maybe - remove if not used
        // global.io.sockets.in(this.gameid).emit('collisionpost', {post: post, ball: ball});

        let bound = this.getBoundsFromPositions(ball, post, true);
        let angle = this.getAngleFromBounds(bound);
        ball.bounce(angle);
    }

    onCollisionBallPowerup(powerup, ball){
        powerup.collectPowerUp();
        global.io.sockets.in(this.gameid).emit('powerupcollected');
        this.powerUp.isActive = false;
        this.powerup = null;
        this.spawnPowerUpTimer();
    }

    onCollisionBallBall(ballA, ballB) {
        // store pre change velocities
        let ballAVelo = ballA.velocity;
        let ballBVelo = ballB.velocity;
        let ballAPos = {x: ballA.x, y: ballA.y};
        let ballBPos = {x: ballB.x, y: ballB.y};


        let bound = this.getBoundsFromPositions(ballAPos, ballBPos, false);
        let angle = this.getAngleFromBounds(bound);
        ballA.bounce(angle, ballBVelo.x, ballBVelo.y);

        let bound2 = this.getBoundsFromPositions(ballBPos, ballAPos, false);
        let angle2 = this.getAngleFromBounds(bound2);
        ballB.backstep();
        ballB.bounce(angle2, ballAVelo.x, ballAVelo.y);

    }


    onCollisionPlayerBall(player, ball) {
        // emit this shit for game to know where collision occurred, well, where the ball was when it did
        global.io.sockets.in(this.gameid).emit('collisionplayer', {player: player, ball: ball});

        let bound = this.getBoundsFromPositions(ball, player, true);
        let angle = this.getAngleFromBounds(bound);
        ball.bounce(angle, player.velocity.x, player.velocity.y);
    }

    onCollisionPlayerPost(player, post) {

        // lengthy backstep
        if (post.x < player.x) player.x += player.baseSpeed;
		else if (post.x > player.x)player.backstep();
        
        if (post.y < player.y) player.y += player.baseSpeed;
		else if (post.y > player.y) player.backstep();
    }

    onCollisionGoalBall(goal, ball) {
        let player = goal.owner;
        global.io.sockets.in(this.gameid).emit('goalscored', {id:player.id});
        player.lives--;
        if(player.lives <= 0 ){

            goal.isActive = false;

            this.killPlayer(player);
            if(Object.keys(this.players).length <= 1){
                this.endGame();
            }
        }
        this.resetBallPosition(ball);
    }

    endGame(){
        let winningPlayer;
        for(let  playerKey in this.players){
            winningPlayer = this.players[playerKey];
        }
        global.io.sockets.in(this.gameid).emit('endgame', {id:winningPlayer.id});
        this.destroy();
    }

    destroy(){
        clearTimeout(this.powerUpSpawnTimer);
        systems.removeFromUpdater(this.updaterID);
        delete this.collisionManager; // clean up the game
    }

    getPlayerGoalDirection(playerPos){
        switch (playerPos) {
            case 0: return {x:-1, y:0 };
            case 1: return {x:1, y:0 };
            case 2: return {x:0, y:1 };
            case 3: return {x:0, y:-1 };
        }
    }

    roleBallVelocity(ball){
        let newVelocity = {x:0,y:0};
        let velocityFactor = randomInt(3, 5);
        let goalPosition = randomInt(0, Object.keys(this.players).length);
        let direction = this.getPlayerGoalDirection(goalPosition);
        newVelocity.x = direction.x * velocityFactor;
        newVelocity.y = direction.y * velocityFactor;

        ball.setVelocity(newVelocity.x, newVelocity.y)
    }

    resetBallPosition(ball){
        ball.isActive = false;
        ball.x = getCentreX();
        ball.y = getCentreY();
        ball.setVelocity(0,0);
        // pause the ball for a second - we can do something clientside to make this nicer
        setTimeout(()=>{
            this.roleBallVelocity(ball);
            ball.isActive = true;
        }, 2000)

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
}



module.exports = {createManager, createNewGame};