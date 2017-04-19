/*Prevents certain actions from being taken and throws more exceptions, useful for
catching common erros brought on by bad coding practices or unsafe actions.*/
"use strict";

/*----------SETUP AND TEMPLATE OBJECTS----------*/
//Setup all global variables and objects.
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

/*Ensures requestAnimationFrame works on all browsers.*/
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

/*Template Vector2 object for easier access to an objects position
and easier physics calculations.*/
function Vector2(x, y)
{
	this.x = x;
	this.y = y;

}

/*Stores key presses. Set to true/false in respective keydown/keyup functions.*/
var keydown = {w: false, s: false, uparrow: false, downarrow: false};

/*----------GAME OBJECTS----------*/
//Paddle Constructor Function
function Paddle(xPos, yPos)
{
	this.width = 5; //Paddle width in px.
	this.height = 50; //Paddle height in px.

	/*The Paddle's x and y position stored as a vector.*/
	this.pos = new Vector2(xPos, yPos);
}
//Function to draw the Paddle.
Paddle.prototype.render = function()
{
	/*Create a rectangle at the paddle's x and y positions with the
	paddles's width and height.*/
	ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
};
Paddle.prototype.move = function(direction)
{
	// TODO: Modify code so the paddle goes up and down but not outside the area of play.
	if (direction == "up")
	{
		//Move paddle up.
		this.pos.y -= 10;
	}
	else if (direction == "down")
	{
		//Move paddle down.
		this.pos.y += 10;
	}
};

//Ball Constructor Function
function Ball()
{
	/*Ball speed on the x and y axis as a vector.*/
	this.speed = new Vector2(10, 10);

	this.radius = 5; //Radius in px.

	/*Ball x and y positions as a vector.*/
	this.pos = new Vector2(canvas.width * 0.5, canvas.height * 0.5)
}
//Function to draw the Ball.
Ball.prototype.render = function()
{
	ctx.beginPath();
	/*Create a circle at the ball's x and y position with the ball's radius.*/
	ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
	ctx.fill();
};

function Boundaries()
{

}

//Initialising the objects.
var player1;
var player2;
var ball;
function initialiseObjects()
{
	player1 = new Paddle(canvas.width * 0.01, 0);
	player1.pos.y = (canvas.height * 0.5) - (player1.height / 2);

	player2 = new Paddle(canvas.width * 0.99, 0);
	player2.pos.y = (canvas.height * 0.5) - (player2.height / 2);

	ball = new Ball();
}
initialiseObjects();

function render()
{
	ctx.fillStyle = "#FFFFFF"; //Set the colour of the components within the canvas.
	ctx.clearRect(0, 0, canvas.width, canvas.height); //Clear the canvas before drawing the next frame.
	ctx.fillRect(canvas.width / 2, 0, 2, canvas.height);

	//Draw the ball.
	ball.render();

	//Draw player one's paddle.
	player1.render();

	//Draw player two's paddle.
	player2.render();

	// TODO: Make sure to render the top and bottom rectangle (i.e boundaries)
}

function control()
{
	if(keydown.w)
	{
		player1.move("up");
	}
	else if (keydown.s)
	{
		player1.move("down");
	}
	if (keydown.uparrow)
	{
		player2.move("up");
	}
	else if (keydown.downarrow)
	{
		player2.move("down");
	}
}
/*----------EVENT AND GAME LOOP FUNCTIONS----------*/
//Used to update objects by the time.
function update(timeElapsed)
{
	control();
	// TODO: Update ball position based on time elapsed
	// TODO: Bounce the ball of top and bottom rectangles
  	// TODO: Record score and reset if ball goes passed the left or right paddle
  	// TODO: Bounce the ball off the paddle
}

/*Checks for keyboard input and stores whether the keys w, s, up or down are being pressed,
this allows actions outside of here to be called if those keys are pressed. Uses the keydown 
object declared at the top of the js file.*/
function keyDown(event)
{
	if (event.keyCode == 87)
	{
		keydown.w = true;
	}
	else if (event.keyCode == 83)
	{
		keydown.s = true;
	}
	if (event.keyCode == 38)
	{
		keydown.uparrow = true;
	}
	else if (event.keyCode == 40)
	{
		keydown.downarrow = true;
	}
}
function keyUp(event)
{
	if (event.keyCode == 87)
	{
		keydown.w = false;
	}
	else if (event.keyCode == 83)
	{
		keydown.s = false;
	}
	if (event.keyCode == 38)
	{
		keydown.uparrow = false;
	}
	else if (event.keyCode == 40)
	{
		keydown.downarrow = false;
	}
}

window.addEventListener("keydown", keyDown); // listen to keyboard button press
window.addEventListener("keyup", keyUp); // listen to keyboard button press

//Game Loop
var previous; 
function game_loop(timestamp)
{
	/*If there is no previous time, start with no elapsed time.*/
	if (!previous) previous = timestamp;

  	var timeElapsed = (timestamp - previous) / 1000;  //work out the elapsed time
  	update(timeElapsed); //update the game based on elapsed time
  	
	// TODO: render scene here (e.g draw ball, draw paddle, top and bottom rectangle detection), this function already exist;  	
  	render();
  	previous = timestamp;  //set the previous timestamp ready for next time
  	requestAnimationFrame(game_loop); //Recursively calls the game loop every animation frame when the browser is ready.
}

requestAnimationFrame(game_loop); //Initial call of the Game Loop.