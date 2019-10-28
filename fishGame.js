"use strict";
var player;
var obstacles = [];
var hitbox = [];
var coins = [];
var score = 0;
var scoreFeed;
var bombs = [];
var bubbles = [];
var message;
var missles = [];

var gameArea = {
    canvas : document.createElement("canvas"),
    restart : document.getElementById("livendie"),
    start : function(){
        this.canvas.width = 1500;
        this.canvas.height = 900;
        this.canvas.style.backgroundImage = "url('background.png')";
        this.canvas.style.borderStyle = "solid";
        this.canvas.style.borderColor = "black";
        this.draw = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNum = 0;
        this.running = setInterval(update, 16);
        window.addEventListener("keydown", function(e){
            e.preventDefault();
            gameArea.keys = (gameArea.keys|| []);
            gameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener("keyup", function(e){
            gameArea.keys[e.keyCode] = (e.type == "keydown");
        })
    },
    blank : function(){
        this.draw.clearRect(0,0, this.canvas.width, this.canvas.height);
    },
    stop : function(){
        message.text = "Game over. Press space to restart";
        message.paint();
        clearInterval(this.running);
    }
}


function gameRun(){
    player = new gameObject(240,90,"submarine2.png",20,300,1);
    hitbox.push(new gameObject(70, 36,"#ff0000",20,335));
    hitbox.push(new gameObject(90,50,"#ff0000",90,330));
    hitbox.push(new gameObject(70,13,'#ff0000',95,317));
    hitbox.push(new gameObject(55,10,'#ff0000',108,380));
    hitbox.push(new gameObject(12,15,"#ff0000",119,300));
    hitbox.push(new gameObject(7,5,'#ff0000',168,325));
    hitbox.push(new gameObject(6,35,'#ff0000',180,337));
    hitbox.push(new gameObject(6,25,'#ff0000',185,342));
    message = new gameObject('70px', 'Lucida Console', "#ff0000", 60, 450, 0);
    scoreFeed = new gameObject("40px", "Lucida Console", "white", 20, 40, 0);
    gameArea.start();
}

function gameObject(width, height,color, x, y, p){
    switch(p){
        case 1:
            this.sprite = new Image();
            this.sprite.src = color;
    }
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.forceDown = 0.03;
    this.speedDown = 0;
    this.width = width;
    this.height = height;
    this.paint = function(){
        var blah = gameArea.draw;
        switch(p){
            case 1:
                blah.drawImage(this.sprite,this.x,this.y,this.width,this.height);
                break;
            case 0:
                blah.font = this.width + " " + this.height;
                blah.fillStyle = color;
                blah.fillText(this.text, this.x, this.y);
            default:
                blah.strokeStyle = color;
                blah.strokeRect(this.x,this.y,this.width,this.height);
                break;
        }
    }
    this.newPlace = function(){
        this.speedDown += this.forceDown;
        this.x += this.speedX;
        this.y += this.speedY + this.speedDown;
        this.topBoundary();
        this.bottomBoundary();
        this.leftBoundary();
        this.rightBoundary();
        this.maxSpeed();
    }
    this.topBoundary = function(){
        if(this.y < 0){
            gameArea.stop();
        }
    }
    this.bottomBoundary = function(){
        var subzero = gameArea.canvas.height-this.height;
        if(this.y > subzero){
            gameArea.stop();
        }
    }
    this.leftBoundary = function(){
        if(this.x < 0){
            /*this.x=0;
            this.speedX = 0;*/
            gameArea.stop();
        }
    }
    this.rightBoundary = function(){
        var wall = gameArea.canvas.width - this.width;
        if(this.x > wall){
            /*this.x = wall;
            this.speedX = 0;*/
            gameArea.stop();
        }
    }
    this.maxSpeed = function(){
        switch(this.speedX){
            case 6:
                this.speedX = 5;
                break;
            case -6:
                this.speedX = -5;
                break;
        }
        switch(this.speedY){
            case -6:
                this.speedY = -5;
        }  
    }
    this.blackbox = function(obs){
        var shipleft = this.x;
        var shipright = this.x + (this.width);
        var shiptop = this.y;
        var shipdown = this.y + (this.height);
        var wallLeft = obs.x;
        var wallright = obs.x + (obs.width);
        var walltop = obs.y;
        var walldown = obs.y + (obs.height);
        var crash = true;
        if(shipleft > wallright || shipright < wallLeft || shiptop > walldown || shipdown < walltop){
            crash = false;
        }
        return crash;
    }
}
function mayday(o){
    var ycord;
    var size;
    var gap;
    var whoop=gameArea.canvas.width;
    var mingap = player.height*2.5;
    var maxgap = player.height*4;
    var tall;
    var maxtall = gameArea.canvas.width / 2;
    var mintall = 50;
    switch(o){
        case 0:
            tall = Math.floor(Math.random()*(maxtall-mintall+1)+mintall);
            gap = Math.floor(Math.random()*(maxgap-mingap+1)+mingap);
            obstacles.unshift(new gameObject(50, tall, "caveWall.png", whoop,0,1));
            obstacles.unshift(new gameObject(50, whoop - tall - gap, "caveWall.png", whoop, tall + gap,1));
            break;
        case 1:
            ycord = Math.floor((Math.random()*gameArea.canvas.height));
            coins.unshift(new gameObject(30, 30, "coin.png", gameArea.canvas.width, ycord, 1));
            break;
        case 2:
            bombs.push(new gameObject(50,50,"bomb.png",player.x + player.width + 350,-50,1));
            break;
        case 3:
            missles.push(new gameObject(125,25,"rocket.png",gameArea.canvas.width + 125,player.y + (player.height/2),1));
            break;
        case 4:
            ycord = Math.floor(Math.random()*gameArea.canvas.height);
            size = Math.floor((Math.random()*41)+10);
            bubbles.push(new gameObject(size,size,"bubble.png",gameArea.canvas.width,ycord,1));
            break;
    }
}
function danger(n, m){
    if((gameArea.frameNum / n) % m == 0){
        return true;
    }
    return false;
}
function crush(){
    var kaboom = player.sprite;
    kaboom.src = "submarinexp.png";
    player.forceDown = 1;
}

function update(){
    var i;
    const STACK = hitbox.length;
    var seconds = gameArea.frameNum / 60;
    var pass = 5;
    function collide(s){
        var j;
        for(j=0;j<STACK;j++){
            switch(s){
                case 1:
                    if(hitbox[j].blackbox(coins[i])){
                        coins.pop();
                        score +=10;
                    }
                    break;
                case 0:
                    if(hitbox[j].blackbox(bombs[i])){
                        crush();
                    }
                    break;
                case 2:
                    if(hitbox[j].blackbox(missles[i])){
                        crush();
                    }
                    break;
                default:
                    if(hitbox[j].blackbox(obstacles[i])){
                        crush();
                    }
            }
        }
    }

    gameArea.blank();
    gameArea.frameNum++;
    
    if(danger(150, 1)){//walls
        mayday(0);
    }
    if(danger(221, 3)){//coins
        mayday(1);
    }
    if(seconds >= 15){
        if(danger(221, 1)){//bombs
            mayday(2);
        }
        if(danger(350,2)){//missles
            mayday(3);
        }
        /*charge();
        launch();*/
    }
    if(danger(Math.floor((Math.random()*76)+50),1)){//bubbles
        mayday(4);
    }
    for(i=0;i<bubbles.length;i++){
        bubbles[i].x -= pass;
        bubbles[i].y -= pass;
        bubbles[i].paint();
    }

    for(i=0; i<obstacles.length;i++){  
        collide();
        obstacles[i].x -= pass;
        obstacles[i].paint();
        pass += (pass/100);
        if(obstacles[i].x < -40){
            obstacles.pop();
        }
    }
    for(i=0;i<coins.length;i++){
        collide(1);
        coins[i].x -= pass;
        coins[i].paint();
        if(coins[i].x < -40){
            coins.pop();
        }
    }

    for(i=0;i<bombs.length;i++){
        collide(0);
        //bombs[i].y += Math.floor((Math.random()*6)+2);
        bombs[i].y += pass;
        bombs[i].x -= pass;
        bombs[i].paint();
        if(bombs[i].y > gameArea.canvas.height){
            bombs.shift();
        }
    }
    for(i=0;i<missles.length;i++){
        collide(2);
        missles[i].x -= pass*4;
        missles[i].paint();
        if(missles[i].x < -200){
            missles.shift();
        }
    }


    /*player.speedX = 0;
    player.speedY = 0;*/
    //exclusion of the above code makes the player have momentum, adding some pseudo physics
    const VELOCITY = 0.2;
    if(gameArea.keys && gameArea.keys[37]){
        player.speedX -= VELOCITY;
        hitbox[0].speedX -= VELOCITY;
        hitbox[1].speedX -= VELOCITY;
        hitbox[2].speedX -= VELOCITY;
        hitbox[3].speedX -= VELOCITY;
        hitbox[4].speedX -= VELOCITY;
        hitbox[5].speedX -= VELOCITY;
        hitbox[6].speedX -= VELOCITY;
        hitbox[7].speedX -= VELOCITY;
    };
    if(gameArea.keys && gameArea.keys[38]){
        player.speedY -= VELOCITY; 
        hitbox[7].speedY -= VELOCITY;
        hitbox[0].speedY -= VELOCITY;
        hitbox[1].speedY -= VELOCITY;
        hitbox[2].speedY -= VELOCITY;
        hitbox[3].speedY -= VELOCITY;
        hitbox[4].speedY -= VELOCITY;
        hitbox[5].speedY -= VELOCITY;
        hitbox[6].speedY -= VELOCITY;
    };
    if(gameArea.keys && gameArea.keys[39]){
        player.speedX += VELOCITY;
        hitbox[0].speedX += VELOCITY;
        hitbox[1].speedX += VELOCITY;
        hitbox[2].speedX += VELOCITY;
        hitbox[3].speedX += VELOCITY;
        hitbox[4].speedX += VELOCITY;
        hitbox[5].speedX += VELOCITY;
        hitbox[6].speedX += VELOCITY;
        hitbox[7].speedX += VELOCITY;
    };
    if(gameArea.keys && gameArea.keys[40]){
        player.speedY += VELOCITY; 
        hitbox[0].speedY += VELOCITY;
        hitbox[1].speedY += VELOCITY;
        hitbox[2].speedY += VELOCITY;
        hitbox[3].speedY += VELOCITY;
        hitbox[4].speedY += VELOCITY;
        hitbox[5].speedY += VELOCITY;
        hitbox[6].speedY += VELOCITY;
        hitbox[7].speedY += VELOCITY;
    };
    player.newPlace();
    player.paint();
    for(i=0;i<STACK;i++){
        hitbox[i].newPlace();
        //hitbox[i].paint();
    }
    scoreFeed.text = Math.floor(seconds + score);
    scoreFeed.paint();
}

window.addEventListener("load", gameRun);
window.addEventListener("keyup", function(){
    if(gameArea.keys && gameArea.keys[32]){
        location.reload(true);
    }
})