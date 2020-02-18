const textStyles = {
    "header":{
        fill: '#777',
        fontFamily: "arial",
        fontSize: "48px",
    },
    "button":{
        fill: '#999',
        fontFamily: "arial",
        fontSize: "32px",
    },
    "list-item":{
        fill: '#222',
        fontFamily: "arial",
        fontSize: "16px",
    },
    "list-header":{
        fill: '#333',
        fontFamily: "arial",
        fontSize: "18px",
    }

};
var HUDBaseDepth = 10;
// consider making this screens a generic class
class LandingScene extends Phaser.Scene {
    constructor(){
        super({key: 'landing'});
    }
    preload(){
  //      this.load.image('sprite', 'assets/coin.png');
        this.load.image('blue_paddleV', 'assets/blue_paddleV.png');
        this.load.image('green_paddleV', 'assets/green_paddleV.png');
        this.load.image('red_paddleV', 'assets/red_paddleV.png');
        this.load.image('yellow_paddleV', 'assets/yellow_paddleV.png');
        this.load.image('blue_paddleH', 'assets/blue_paddleH.png');
        this.load.image('green_paddleH', 'assets/green_paddleH.png');
        this.load.image('red_paddleH', 'assets/red_paddleH.png');
        this.load.image('yellow_paddleH', 'assets/yellow_paddleH.png');
        this.load.image('ball', 'assets/balltest.png');
    }


    create() {
        let title = this.add.text(gameCenterX(), gameCenterY() - 350, 'Best Pong', textStyles.header);
        offsetByWidth(title);
        this.ip = 'localhost';
        this.socket = '55000';
        // error handle fained connection in lobby switch make sure this has happended
        startClient(this.ip, this.socket);

        let playBtnAction = () => {
            // error handle fained connection in lobby switch
            this.scene.start("lobbyselection");
        };


        // create the button object, no need for an icon, or UI text
        let playBtn = new ImageButton(
            gameCenterX(),
            game.config.height - 55,
            "green_paddleH",
            this,
            playBtnAction,
            "Connect"
            );
        offsetByWidth(playBtn);
    }

    update(){

    }
}



class LobbySelectionScene extends Phaser.Scene {
    constructor() {
        super({key: 'lobbyselection'});
    }

    create() {
        let title = this.add.text(gameCenterX(), gameCenterY() - 350, 'LobbySelection - Stubbed', textStyles.header);
        offsetByWidth(title);
        let playBtnAction =  () => {
            this.scene.start("lobby");
        };


        // create the button object, no need for an icon, or UI text
        let playBtn = new ImageButton(
            gameCenterX(),
            game.config.height - 55,
            "green_paddleH",
            this,
            playBtnAction,
            "ignore this screen"
        );
        offsetByWidth(playBtn);
    }

    update(){

    }
}

var Lobby = {};


class LobbyCard {
    constructor(x,y, scene) {
        this.readyText = scene.add.text(x + 150, y, 'not ready', textStyles.header);
        this.playerText = scene.add.text(x - 150, y, 'playerimage', textStyles.header);
    }
    set readyState(val){
        this.isReady = val;
        if(val){
            this.readyText.text = "ready";
        }
        else{
            this.readyText.text = "not ready";
        }
    }
    set character(val){
        // show an image
    }
}


class LobbyScene extends Phaser.Scene {
    constructor() {
        super({key: 'lobby'});

    }

    create() {
        Client.askJoinLobby();

        this.lobbyCards =  [];
        this.listPos = gameCenterY() - 150//temp

        Lobby.newLobbyMember = ((key, isready, position) => {
            let newCard = new LobbyCard(gameCenterX(), this.listPos, this);
            this.lobbyCards[key] = newCard;
            this.listPos += 25;
        });

        Lobby.memberReadied = ((key, isready, position) => {
            console.log(this.lobbyCards);
            let memberCard = this.lobbyCards[key].readyState = isready;
            console.log(memberCard);
        });


        let header = this.add.text(gameCenterX(), gameCenterY() - 350, 'Lobby', textStyles.header);

        offsetByWidth(header);

        let playBtnAction = () => {
            // we probably want to have seperate ready buttons or somehting ehr
           //Client.triggerLoad();
            Client.memberReadyToggle();
        };

        Game.triggerGame = () =>{
            Game.triggerGame = null;
            this.scene.start("maingame");
        }


        // create the button object, no need for an icon, or UI text
        let playBtn = new ImageButton(
            gameCenterX(),
            game.config.height - 55,
            "green_paddleH",
            this,
            playBtnAction,
            "PLAY"
        );
        offsetByWidth(playBtn);
    }

    update(){

    }
}

// ***** from a1

// probably dont need anything this complicated, icon functinality is pretty useful for mobile friendlyness
// class to allow for the simple creation of buttons
// allows buttons to be definied with an action background, icon and text
class ImageButton {

    // final 2 parameters are optional
    constructor(xPos, yPos, imageRef, scene, action, text, buttonIcon) {

        // create the image defined
        this.newBtn = scene.add.image(xPos, yPos, imageRef);
        this.initialTint = -1;

        // if instantiated with text option create a text UI  object
        if (text && text.length > 0) {
            this.newTxt = scene.add.text(xPos, yPos, text, textStyles.button);
            // make the text appear in the centre of the button

            // offset by its height and width in order to centre it in the middle of the button
            offsetByHeight(this.newTxt);
            offsetByWidth(this.newTxt);
            this.newTxt.depth = HUDBaseDepth + 2;
        }

        // create a button icon if instantiated with a reference.
        if(buttonIcon){
            this.btnIcon = scene.add.image(xPos, yPos, buttonIcon);
            this.btnIcon.depth = HUDBaseDepth + 2;
        }

        this.newBtn.setInteractive();
        this.newBtn.depth = HUDBaseDepth + 1;


        // add a call to the defined action to DOM click event
        this.newBtn.on('pointerdown', () => {
            // feedback for button presses
        //    Audio.uiClickSound.play(); // way to play sound generically with buttons
            action();
        });

        // show the player the click action will be performed on this button
        this.newBtn.on('pointerover', (pointer) => {
            if(this.btnIcon) this.btnIcon.tint = 0xeeeeee;
            this.newBtn.tint = 0xeeeeee;
        });
    ﻿

        // reset the tint to the base one, allow external control for example on settings screen
        this.newBtn.on('pointerout', (pointer) => {
            this.newBtn.tint = this.initialTint;
        });

        return this;
    }


    // hide and show both text and image components of the button
    set visible(isVisible){
        if(this.newTxt) this.newTxt.visible = isVisible;
        if(this.btnIcon) this.btnIcon.visibile = isVisible;

        this.newBtn.visible = isVisible;

    }

    // allow the base tint to be change externaly and propergate to memeber variables
    set baseTint(tint){
        this.initialTint = tint;
        this.newBtn.tint = tint;
    }
    get baseTint(){
        return this.initialTint;
    }


    //disable all components of the button
    set active(isActive){
        if(this.newTxt)this.newTxt.active = isActive;
        if(this.btnIcon) this.btnIcon.active = isActive;
        this.newBtn.active = isActive;
    }

    // rescale all components of the button
    set scale(scale){
        if(this.btnIcon) {this.btnIcon.size(scale)};
        this.newBtn.setScale(scale);
    }

    // reset the tint to no tint
    resetTint(){
        this.baseTint = -1;
        this.newBtn.tint = this.baseTint;
    }
}



// UI helper functions
function offsetByHeight(UIObject){
    UIObject.y = UIObject.y - (UIObject.height /2)
}

function offsetByWidth(UIObject){
    UIObject.x = UIObject.x - (UIObject.width /2)
}
function gameCenterX ()
{
    return game.config.width / 2;
}
function gameCenterY ()
{
    return game.config.height / 2;
}