var Client = {};
//Client.socket = io('http://localhost:55000');





function startClient(ip, socket){
    // error handle fained connection in lobby switch
    Client.socket = io('http://' + ip + ":" + socket);
    Client.sendTest = function(){
        console.log("test sent");
        Client.socket.emit('test');
    };

    Client.sendChangeCharacter = function(characterID){
        Client.socket.emit("changecharacter", {character: characterID});
    }


    Client.askGameConnect = function(){
        Client.socket.emit('gameconnect');
    };

    Client.sendClick = function(x,y){
        Client.socket.emit('click',{x:x,y:y});
    };
    Client.sendMove = function (direction){
        Client.socket.emit('move', {direction:direction});
    };

    Client.sendStopMove = function(){
        Client.socket.emit('stopmove');
    }

    //Jordan any ideas why data.character isn't working here?
    Client.socket.on('newplayer',function(data){
        gameClient.addNewPlayer(data.id, data.characterID, data.x, data.y);
    });


    Client.socket.on('collisionplayer',function(data){
        gameClient.onCollisionPlayerBall(data.player, data.ball);
    });

    //Jordan any ideas why data.character isn't working here?
    Client.socket.on('allplayers',function(data){
        console.log(data);
        for(var i = 0; i < data.length; i++){

            gameClient.addNewPlayer(data[i].id, data[i].characterID ,data[i].x ,data[i].y);
        }

        Client.socket.on('move',function(data){
            gameClient.movePlayer(data.id,data.x,data.y);
        });

        Client.socket.on('remove',function(id){
            gameClient.removePlayer(id);
        });

        Client.socket.on('goalscored',function(data){
            gameClient.goalScored(data.id);
        });

        Client.socket.on('playerdeath',function(data){
            gameClient.playerDeath(data.id);
        });

        Client.socket.on('endgame',function(data){
            gameClient.endGame(data.id);
        });

    });


    Client.socket.on('newball',function(data){
            gameClient.addNewBall(data.x,data.y);

    });


    Client.socket.on('moveball',function(data){
            gameClient.moveBall(data.x,data.y);
    });


    // not like this
    Client.triggerLoad = function(){
        Client.socket.emit('triggerload');
    }


    Client.socket.on('loadgame',function(data){
       Game.triggerGame();
    });




    Client.askJoinLobby = function(){
        Client.socket.emit('joinlobby');
        // extend this by passing in lobby id or something
    };





    Client.socket.on('newmember',function(data){
        if(Lobby.newLobbyMember) {
            Lobby.newLobbyMember(data.position, data.isReady, data.character);
        }
    });




    Client.memberReadyToggle = function(){
        Client.socket.emit('playerreadytoggle');
    }



    Client.socket.on('playerready', function(data){
        console.log(data);
        if(Lobby.memberReadied){
            Lobby.memberReadied(data.position, data.isReady);
        }

    });

    Client.socket.on('characterchange', function (data) {
        console.log(data);
        Lobby.changeLobbyCharacter(data.position, data.character);
    });

    // this could target a specific lobby?
    Client.socket.on('alllobbymembers',function (data) {
        console.log('alllobbymemebrs');
        for(let key in data){
            let member = data[key];
            Lobby.newLobbyMember(key, member.isReady, member.character, member.position);
        }
    });

    // convert to using this kind of prototype notation
}

const gameClient =  {
    setScene: function(scene){
        this.scene = scene;
        console.log(scene);
        Client.askGameConnect();
    },

    addNewPlayer: function(id, character, x, y){
        console.log(character);
        this.scene.addNewPlayer(id, character, x, y);
    },

    movePlayer: function(id,x,y){
      this.scene.movePlayer(id, x, y);
    },

    goalScored: function(id){
        this.scene.goalScored(id);
    },


    playerDeath: function(id){
        this.scene.killPlayer(id);
    },

    endGame: function(winnerId){
        this.scene.endGame(winnerId);
    },

    addNewBall: function(x,y){
        this.scene.spawnBall(x,y)
    },
    moveBall: function(x,y){
        this.scene.moveBall(x,y)
    },
    onCollisionPlayerBall: function(ball, player){
        this.scene.onCollisionPlayerBall(ball, player);
    }
};