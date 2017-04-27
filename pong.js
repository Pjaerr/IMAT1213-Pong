/*Prevents certain actions from being taken and throws more exceptions, useful for
catching common erros brought on by bad coding practices or unsafe actions.*/
"use strict";

/*----------SETUP AND TEMPLATE OBJECTS----------*/
//Setup all global variables and objects.
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var width = canvas.width;
var height = canvas.height;

/*Ensures requestAnimationFrame works on all browsers.*/
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

/*Template Vector2 object for easier access to an objects position
and easier physics calculations.*/
function Vector2(x, y)
{
	this.x = x;
	this.y = y;

}

/*Input() Checks for keyboard input and stores whether the keys w, s, up or down are being pressed,
this allows actions outside of here to be called if those keys are pressed. Uses the keydown 
object declared at the top of the js file.*/
function Input()
{
	/*Stores key presses. Set to true/false in respective keydown/keyup functions.*/
	this.keyboard = 
	{
		w: false, 
		s: false, 
		uparrow: false, 
		downarrow: false
	};

	/*Sets the keyboard.key to true or false depending on whether it is currently
	being pressed.*/
	this.keyDown = function(event)
	{
		switch (event.keyCode)
		{
			case 87:
				this.keyboard.w = true;
				break;
			case 83:
				this.keyboard.s = true;
				break;
			case 38:
				this.keyboard.uparrow = true;
				break;
			case 40:
				this.keyboard.downarrow = true;
				break;
		}
	}
	this.keyUp = function(event)
	{
		switch (event.keyCode)
		{
			case 87:
				this.keyboard.w = false;
				break;
			case 83:
				this.keyboard.s = false;
				break;
			case 38:
				this.keyboard.uparrow = false;
				break;
			case 40:
				this.keyboard.downarrow = false;
				break;
		}
	}
}

var input = new Input();
window.addEventListener("keydown", function(e)	//Listen for a key being pressed down.
{
	input.keyDown(e);
}); 
window.addEventListener("keyup", function(e)	//Listen for a key being released.
{
	input.keyUp(e);
}); 

//Collision Detection
function Collision()
{
	this.pointInRect = function(pointY, rect)
	{
		return (pointY >= rect.pos.y && pointY <= rect.pos.y + rect.height);
	}
}

var col = new Collision();

/*----------GAME OBJECTS----------*/
//Paddle Constructor Function
function Paddle(xPos, yPos)
{
	this.width = 10; //Paddle width in px.
	this.height = 80; //Paddle height in px.
	this.movementSpeed;

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
Paddle.prototype.onCollisionEnter = function()
{
	if (col.pointInRect(this.pos.y, topWall))
	{
		this.pos.y += this.movementSpeed;
	}
	else if (col.pointInRect(this.pos.y + this.height, bottomWall))
	{
		this.pos.y -= this.movementSpeed;
	}
};
Paddle.prototype.move = function(direction, timeElapsed)
{
	this.movementSpeed = 500 * timeElapsed;
	this.onCollisionEnter();

	if (direction == "up")
	{
		//Move paddle up.
		this.pos.y -= this.movementSpeed;
	}
	else if (direction == "down")
	{
		//Move paddle down.
		this.pos.y += this.movementSpeed;
	}
};

//Ball Constructor Function
function Ball(startingVelocity, radius)
{
	/*Ball speed on the x and y axis as a vector.*/
	this.velocity = startingVelocity;

	this.radius = radius; //Radius in px.

	/*Ball x and y positions as a vector.*/
	this.pos = new Vector2(width * 0.5, height * 0.5)
}
//Function to draw the Ball.
Ball.prototype.render = function()
{
	ctx.beginPath();
	/*Create a circle at the ball's x and y position with the ball's radius.*/
	ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
	ctx.fill();
};

function Boundaries(pos, w, h)
{
	this.pos = pos;
	this.width = w;
	this.height = h;
}
Boundaries.prototype.render = function()
{
	ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height); //Create Boundary.
}

//Initialising the objects.
var player1;
var player2;
var ball;
var topWall;
var bottomWall;
function initialiseObjects()
{
	player1 = new Paddle(width * 0.01, 0);
	player1.pos.y = (height * 0.5) - (player1.height / 2);

	player2 = new Paddle(width * 0.99, 0);
	player2.pos.y = (height * 0.5) - (player2.height / 2);

	ball = new Ball(new Vector2(500, 0), 5);

	topWall = new Boundaries(new Vector2(0, 0), width, 20);
	bottomWall = new Boundaries(new Vector2(0, (height - 20)), width, 20);
}
initialiseObjects();



function render()
{
	ctx.fillStyle = "#FFFFFF"; //Set the colour of the components within the canvas.
	ctx.clearRect(0, 0, width, height); //Clear the canvas before drawing the next frame.
	ctx.fillRect(width / 2, 0, 2, height);	//The "net" in the middle of the level.

	//Draw the ball.
	ball.render();

	//Draw player one's paddle.
	player1.render();

	//Draw player two's paddle.
	player2.render();

	//Draw the level boundaries.
	topWall.render();
	bottomWall.render();

}

/*This function checks if the variables inside of the keydown object
are true and calls the relevant move function if they are. This function does not
check for any input.*/
function movePaddles(timeElapsed)
{
	if(input.keyboard.w)
	{
		player1.move("up", timeElapsed);
	}
	else if (input.keyboard.s)
	{
		player1.move("down", timeElapsed);
	}
	if (input.keyboard.uparrow)
	{
		player2.move("up", timeElapsed);
	}
	else if (input.keyboard.downarrow)
	{
		player2.move("down", timeElapsed);
	}
}

Collision.prototype.circleInRect = function(point, rect)
{
	return (point.x >= rect.pos.x && point.x <= rect.pos.x + rect.width && 
			point.y >= rect.pos.y && point.y <= rect.pos.y + rect.height);
}

Ball.prototype.move = function(timeElapsed)
{
	this.pos.x += this.velocity.x * timeElapsed;
	this.pos.y += this.velocity.y * timeElapsed;

	if (col.circleInRect(this.pos, player2))
	{
		this.velocity.x = -this.velocity.x + -20;
		this.velocity.y = player2.pos.y;
	}
	else if (col.circleInRect(this.pos, player1))
	{
		this.velocity.x = this.velocity.x * -1 + 20;
		this.velocity.y = player1.pos.y;
	}
	
	if (col.circleInRect(this.pos, topWall))
	{
		this.velocity.y = -this.velocity.y;
	}
	else if (col.circleInRect(this.pos, bottomWall))
	{
		this.velocity.y = this.velocity.y * -1;
	}
}
/*----------EVENT AND GAME LOOP FUNCTIONS----------*/
//Used to update objects by the time.
function update(timeElapsed)
{
	movePaddles(timeElapsed);
	ball.move(timeElapsed);

	// TODO: Update ball position based on time elapsed
	// TODO: Bounce the ball of top and bottom rectangles
  	// TODO: Record score and reset if ball goes passed the left or right paddle
  	// TODO: Bounce the ball off the paddle
}

//Game Loop
var previous; 
function game_loop(timestamp)
{
	/*If there is no previous time, start with no elapsed time.*/
	if (!previous) previous = timestamp;

  	var timeElapsed = (timestamp - previous) / 1000;  //Work out the elapsed time.
	  
  	update(timeElapsed); //Update the game based on elapsed time.
  	 	
  	render();	//Renders the game.
	  
  	previous = timestamp;  //set the previous timestamp ready for next time
  	requestAnimationFrame(game_loop); //Recursively calls the game loop every animation frame when the browser is ready.
}

requestAnimationFrame(game_loop); //Initial call of the Game Loop.