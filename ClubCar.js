//The starting position for the car
x = 400;
y = 400;
accelaration = 0.2;
maxSpeed = 6;
speedX = 0;
speedY = 0;
friction = 0.1;
angle = 0;
mod = 0;
canvas = document.getElementById("gameSpace");
context = canvas.getContext("2d");

window.addEventListener("keydown", keypress_handler, false);
window.addEventListener("keyup", keyup_handler, false);

var ctx = canvas.getContext('2d');
ctx.fillStyle = '#f00';


var moveInterval = setInterval(function () {
    draw();
}, 15);

function draw() {
    context = canvas.getContext("2d");
    context.clearRect(0, 0, 1600, 1600);

    context.fillStyle = "rgb(200, 100, 220)";

    drawCar(cornerCalcX(x+30,y+10),cornerCalcY(x+30,y+10),
            cornerCalcX(x-10,y+10),cornerCalcY(x-10,y+10),
            cornerCalcX(x-10,y-10),cornerCalcY(x-10,y-10),
            cornerCalcX(x+30,y-10),cornerCalcY(x+30,y-10));

    calculateSpeed();
}

function calculateSpeed(){
    speedX += accelaration*Math.cos(angle)*mod; 
    speedY += accelaration*Math.sin(angle)*mod;

    speedX = Approach(speedX, 0, friction);
    speedY = Approach(speedY, 0, friction);
    
    if (speedX > maxSpeed) {speedX = maxSpeed};
    if (speedX < -maxSpeed) {speedX = -maxSpeed};
    if (speedY > maxSpeed) {speedY = maxSpeed};
    if (speedY < -maxSpeed) {speedY = -maxSpeed};

    if ((x+speedX < 1600)*(x+speedX > 0)) {x += speedX};
    if ((y+speedY < 800)*(y+speedY > 0)) {y += speedY};
}

function drawCar(c1x,c1y,c2x,c2y,c3x,c3y,c4x,c4y) {
    ctx.beginPath();
    ctx.moveTo(c1x,c1y);
    ctx.lineTo(c2x,c2y);
    ctx.lineTo(c3x,c3y);
    ctx.lineTo(c4x,c4y);
    ctx.closePath();
    ctx.fill();
}

function cornerCalcX(cornerX,cornerY){
    return (Math.cos(angle)*(cornerX-x)) - (Math.sin(angle)*(cornerY-y)) + x;
}
function cornerCalcY(cornerX,cornerY){
    return (Math.sin(angle)*(cornerX-x)) + (Math.cos(angle)*(cornerY-y)) + y;
}

function keyup_handler(event) {
    if (event.keyCode == 87 || event.keyCode == 83) {
        mod = 0;
    }
}

function keypress_handler(event) {
    console.log(event.keyCode);
    if (event.keyCode == 87) {
        mod = 1;
    }
    if (event.keyCode == 83) {
        mod = -1;
    }
    if (event.keyCode == 65) {
        angle -= 0.05;
    }
    if (event.keyCode == 68) {
        angle += 0.05;
    }
}

function Approach(currentValue, desiredValue, ammount ) {
    if (currentValue < desiredValue) {
        currentValue += ammount;
        if (currentValue > desiredValue) {
            return desiredValue;
        }
    }
    else {
        currentValue -= ammount
        if (currentValue < desiredValue){
            return desiredValue;
        }
    }
    return currentValue
}
