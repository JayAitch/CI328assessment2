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
//https://www.kenney.nl/assets/game-icons
const characters = {"Big":{},"Medium":{}, "Small":{}}  // probably store this somewhere more relevant
const charactersArray = ["BIG","MEDIUM", "SMALL"]; //temp this could be constructed by the characters map or somehtign
var HUDBaseDepth = 10;
// consider making this screens a generic class
class LandingScene extends Phaser.Scene {
    constructor(){
        super({key: 'landing'});
    }
    preload(){
        // this.load.image('sprite', 'assets/coin.png');
        this.load.image('green_paddleH', 'assets/green_paddleH.png');
        this.load.image('ball', 'assets/ball.png');
        this.load.image('UILeft', 'assets/arrowLeft.png');
        this.load.image('UIRight', 'assets/arrowRight.png');
        this.load.image('eye', 'assets/eye.png');
        this.load.atlasXML('slimeMiddle', 'assets/SlimeMiddle.png', 'assets/SlimeMiddle.xml');
        this.load.atlasXML('slimeLeft', 'assets/slimeLeft.png', 'assets/slimeLeft.xml');
        this.load.atlasXML('slimeRight', 'assets/slimeRight.png', 'assets/slimeRight.xml');
        this.load.atlasXML('metalMiddle', 'assets/MetalMiddle.png', 'assets/MetalMiddle.xml');
        this.load.atlasXML('metalLeft', 'assets/metalLeft.png', 'assets/metalLeft.xml');
        this.load.atlasXML('metalRight', 'assets/metalRight.png', 'assets/metalRight.xml');
        this.load.atlasXML('socket', 'assets/socket.png', 'assets/socket.xml');
    }

    createAnimation(key, repeat, frameRate, spriteSheet, animationName, startFrame, endFrame, yoyo) {
        this.anims.create({
          key: key,
          repeat: repeat,
          frameRate: frameRate,
          yoyo: (yoyo || false),
          frames: this.anims.generateFrameNames(spriteSheet, {
            prefix: animationName,
            suffix: '',
            start: startFrame,
            end: endFrame
          })
        });
      }

    create() {
        this.createAnimation('slimeMiddleLeft', -1, 5, 'slimeMiddle', 'SlimeMiddle', 0, 1);
        this.createAnimation('slimeMiddleIdle', -1, 5, 'slimeMiddle', 'SlimeMiddle', 1, 1);
        this.createAnimation('slimeMiddleRight', -1, 5, 'slimeMiddle', 'SlimeMiddle', 1, 2);
        this.createAnimation('slimeLeftLeft', -1, 5, 'slimeLeft', 'SlimeLeft', 0, 1);
        this.createAnimation('slimeLeftIdle', -1, 5, 'slimeLeft', 'SlimeLeft', 1, 1);
        this.createAnimation('slimeLeftRight', -1, 5, 'slimeLeft', 'SlimeLeft', 1, 2);
        this.createAnimation('slimeRightLeft', -1, 5, 'slimeRight', 'SlimeRight', 0, 1);
        this.createAnimation('slimeRightIdle', -1, 5, 'slimeRight', 'SlimeRight', 1, 1);
        this.createAnimation('slimeRightRight', -1, 5, 'slimeRight', 'SlimeRight', 1, 2);

        this.createAnimation('metalMiddleLeft', -1, 5, 'metalMiddle', 'MetalMiddle', 0, 1);
        this.createAnimation('metalMiddleIdle', -1, 5, 'metalMiddle', 'MetalMiddle', 1, 1);
        this.createAnimation('metalMiddleRight', -1, 5, 'metalMiddle', 'MetalMiddle', 1, 2);
        this.createAnimation('metalLeftLeft', -1, 5, 'metalLeft', 'MetalLeft', 0, 2);
        this.createAnimation('metalLeftIdle', -1, 5, 'metalLeft', 'MetalLeft', 2, 2);
        this.createAnimation('metalLeftRight', -1, 5, 'metalLeft', 'MetalLeft', 2, 4);
        this.createAnimation('metalRightLeft', -1, 5, 'metalRight', 'MetalRight', 0, 2);
        this.createAnimation('metalRightIdle', -1, 5, 'metalRight', 'MetalRight', 2, 2);
        this.createAnimation('metalRightRight', -1, 5, 'metalRight', 'MetalRight', 2, 4);
        
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

    constructor(x,y,scene, isReady, character) {
        this.readyText = scene.add.text(x + 150, y, 'not ready', textStyles.header);
        this.playerText = scene.add.text(x - 150, y, 'playerimage', textStyles.header);
        this.readyState = isReady;
        this.character = character;
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
        this.selctedCharacter = val;
        this.playerText.text = val;
    }
}


class LobbyScene extends Phaser.Scene {
    constructor() {
        super({key: 'lobby'});
        this.selectedCharacter = 0;

    }

    create() {
        Client.askJoinLobby();

        this.lobbyCards =  [];
        this.listPos = gameCenterY() - 150//temp

        Lobby.newLobbyMember = ((key, isready, character) => {
            let newCard = new LobbyCard(gameCenterX(), this.listPos, this, isready,  character);
            this.lobbyCards[key] = newCard;
            this.listPos += 25;
        });

        Lobby.memberReadied = ((key, isready, position) => {
            let memberCard = this.lobbyCards[key].readyState = isready;
            console.log(memberCard);
        });

        Lobby.changeLobbyCharacter = ((key, character) => {
            console.log(character);
            let lobbyCard = this.lobbyCards[key];
            lobbyCard.character = character;
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
            this.scene.remove('lobby');
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

        this.createCharacterSelectionControls();

    }


    createCharacterSelectionControls(){
        // this will probably be a sprite
        this.selectedCharacterText = this.add.text(gameCenterX(), game.config.height - 155, charactersArray[this.selectedCharacter], textStyles.header);
        offsetByWidth(this.selectedCharacterText);
        let leftButtonAction = () => {
            // error handle fained connection in lobby switch
            //this.scene.start("lobbyselection");
            this.selectCharacter(-1);
        };


        // create the button object, no need for an icon, or UI text
        let leftButton = new ImageButton(
            gameCenterX() - 150,
            game.config.height - 155,
            "UILeft",
            this,
            leftButtonAction
        );


        let rightButtonAction = () => {
            // error handle fained connection in lobby switch
            //this.scene.start("lobbyselection");
            this.selectCharacter(+1);
        };


        // create the button object, no need for an icon, or UI text
        let rightButton = new ImageButton(
            gameCenterX() + 150,
            game.config.height - 155,
            "UIRight",
            this,
            rightButtonAction
        );
    }

    selectCharacter(direction){
        this.selectedCharacter = this.selectedCharacter + direction;
        if(this.selectedCharacter < 0) this.selectedCharacter = charactersArray.length - 1;
        if(this.selectedCharacter > charactersArray.length -1) this.selectedCharacter = 0;
        this.changeCharacter();
    }

    // if we switch to a map maybe use a key
    changeCharacter(){
        let characterMapKey = charactersArray[this.selectedCharacter]
        this.selectedCharacterText.text = characterMapKey;
        // and send message
        Client.sendChangeCharacter(characterMapKey);
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