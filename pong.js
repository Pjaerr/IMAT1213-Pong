/*
	There is a GameManager class at the bottom of the JS file that handles all of the loose game functions. These can be accessed via the
	'game' instance. At the very top of the JS file there are the references, and the intially empty game objects such as walls, ball or paddles,
	these are all intialised via the GameManager class using the initialiseObjects() function. Also at the top are some template functions to make
	things easier such as a Vector2 class and an Input class.
*/

/*Prevents certain actions from being taken and throws more exceptions, useful for
catching common erros brought on by bad coding practices or unsafe actions.*/
"use strict";

/*----------SETUP AND TEMPLATE OBJECTS----------*/
//Setup all global variables and objects.
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var width = canvas.width;
var height = canvas.height;
var paddleHitSound = new Audio("sounds/ping_pong_8bit_plop.ogg");
var exitLevelSound = new Audio("sounds/ping_pong_8bit_peeeeeep.ogg");

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
this allows actions outside of here to be called if those keys are pressed. Uses the keydown and
 keyup event listeners to receive keyboard input.*/
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

//Collision Detection Class
function Collision()
{
	/*Point in rect function takes a point as a Vector (x, y) and a
	rectangle by which to check the point. It returns true if the point
	is within the rectangle.*/
	this.pointInRect = function(point, rect)
	{
		return (point.x >= rect.pos.x && point.x <= rect.pos.x + rect.width && 
			point.y >= rect.pos.y && point.y <= rect.pos.y + rect.height);
	}
}

var col = new Collision();	//Instance of Collision so that the functions can be used externally.

/*----------GAME OBJECTS----------*/
/*The game objects, all initialised in GameManager.initialiseObjects.*/
var player = [];	
var ball;			
var wall = [];		
var winArea = [];

//Paddle Constructor Function
function Paddle(xPos, yPos)
{
	this.score = 0;
	this.width = 20; //Paddle width in px.
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
	ctx.fillStyle = "#810000";
	ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
};
Paddle.prototype.onCollisionEnter = function()
{
	/*Checks if the top of this paddle is within the top boundary*/
	if (col.pointInRect(this.pos, wall[0]))
	{
		this.pos.y += this.movementSpeed;	//Pushes the player down by it's movementSpeed. Ensuring it cannot move up.
	}
	/*Checks if the bottom of this paddle is within the bottom boundary*/
	else if (col.pointInRect(new Vector2(this.pos.x, this.pos.y + this.height), wall[1]))
	{
		this.pos.y -= this.movementSpeed;	//Pushes the player up by it's movementSpeed. Ensuring it cannot move down.
	}
};
Paddle.prototype.move = function(direction, timeElapsed)
{
	this.movementSpeed = 600 * timeElapsed;	//Setting movementSpeed to an abritary value multiplied by delta time.

	this.onCollisionEnter();	//Checks for collision.

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
Paddle.prototype.reset = function()
{
	this.pos = new Vector2(this.pos.x, (height * 0.5) - (this.height / 2));
};

//Ball Constructor Function
function Ball(startingVelocity, radius)
{
	/*Ball speed on the x and y axis as a vector.*/
	this.velocity = startingVelocity;

	this.increaseAmt = 20; //Amount to speed up the ball by.

	this.radius = radius; //Radius in px.

	/*Ball x and y positions as a vector.*/
	this.pos = new Vector2(width * 0.5, height * 0.5);

	this.onCollisionEnter = function()
	{
		/*Checks to see if the ball is colliding with the paddles and if so,
		it reverses the ball's X velocity and gives it the Y velocity of the paddle
		it collided with. Carries out a point in rect collision, making the point from
		the centre of the circle going out by radius so that the collision check occurs to the edge of the circle.*/
		if (col.pointInRect(new Vector2(this.pos.x + this.radius, this.pos.y), player[1]))
		{
			this.velocity.x = -this.velocity.x + -this.increaseAmt;	//Slowly increase speed of ball on the X axis over time.
			this.velocity.y = player[1].pos.y;
			paddleHitSound.play();
		}
		else if (col.pointInRect(new Vector2(this.pos.x - this.radius, this.pos.y), player[0]))
		{
			this.velocity.x = this.velocity.x * -1 + this.increaseAmt;	//Slowly increase speed of ball on the X axis over time.
			this.velocity.y = player[0].pos.y;
			paddleHitSound.play();
		}
		/*Check if the ball is colliding with the winAreas behind the paddles
		and if so, call the game.pointScored function, passing in the number of
		the player opposite to the goal that was collided with*/
		else if (col.pointInRect(this.pos, winArea[1]))
		{
			game.pointScored(1);
		}
		else if (col.pointInRect(this.pos, winArea[0]))
		{
			game.pointScored(2);
		}
		
		/*Checks for collision with the boundaries, if so, reverses Y velocity.*/
		if (col.pointInRect(new Vector2(this.pos.x, this.pos.y), wall[0]))
		{
			this.velocity.y = -this.velocity.y;
		}
		else if (col.pointInRect(new Vector2(this.pos.x, this.pos.y), wall[1]))
		{
			this.velocity.y = this.velocity.y * -1;
		}
	}
	this.move = function(timeElapsed)
	{
		/*Changes the ball's x and y positions by its velocity multiplied by the timeElapsed in the last
		frame. (delta time).*/
		this.pos.x += this.velocity.x * timeElapsed;
		this.pos.y += this.velocity.y * timeElapsed;

		/*Checks if the velocity is going over a certain speed. If so it keeps it within that speed.
		This stops any stray mishaps with collision due to the ball going exceedingly fast.*/
		if (this.velocity.x >= 700)
		{
			this.increaseAmt = -20;
		}
		else if(this.velocity.x <= 600)
		{
			this.increaseAmt = 20;
		}

		this.onCollisionEnter();	//Checks for collision at the end of each movement check.
	}
}
/*Function used to reset the ball*/
Ball.prototype.reset = function(dir)
{
	this.pos = new Vector2(width * 0.5, height * 0.5);
	this.velocity = new Vector2(300 * dir, 0);
};
//Function to draw the Ball.
Ball.prototype.render = function()
{
	ctx.beginPath();
	/*Create a circle at the ball's x and y position with the ball's radius.*/
	ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
	ctx.fillStyle = "#39FF14";
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

/*This function checks if the variables inside of the keyboard object
are true and calls the relevant move function if they are. This function does not
check for any input directly.*/
function movePaddles(timeElapsed)
{
	if(input.keyboard.w)
	{
		player[0].move("up", timeElapsed);
	}
	else if (input.keyboard.s)
	{
		player[0].move("down", timeElapsed);
	}
	if (input.keyboard.uparrow)
	{
		player[1].move("up", timeElapsed);
	}
	else if (input.keyboard.downarrow)
	{
		player[1].move("down", timeElapsed);
	}
}

/*----------EVENT AND GAME LOOP FUNCTIONS----------*/
function GameManager()
{
	this.gameOver = false;

	/*Defines the game objects declared at the top of the JS file and gives
	them starting sizes and positions.*/
	this.initialiseObjects = function()	
	{
		player[0] = new Paddle(20, 0);
		player[0].pos.y = (height * 0.5) - (player[0].height / 2);

		player[1] = new Paddle(width - 40, 0);
		player[1].pos.y = (height * 0.5) - (player[1].height / 2);

		ball = new Ball(new Vector2(300, 0), 5);

		wall[0] = new Boundaries(new Vector2(0, 0), width, 20);
		wall[1] = new Boundaries(new Vector2(0, (height - 20)), width, 20);

		winArea[0] = new Boundaries(new Vector2(-30, 0), 10, height);
		winArea[1] = new Boundaries(new Vector2(width + 15, 0), 10, height);
	}
	this.resetObjects = function(dir)
	{	
		for(var i = 0; i < player.length; i++)
		{
			player[i].reset();
		}

		ball.reset(dir);
	}
	this.updateScore = function(i)
	{
		var elementid = "player" + (i + 1) + "score";
		document.getElementById(elementid).innerHTML = player[i].score;	//Update the score text on the HTML page.
	}
	/*Increments the score value of the player who has scored. This is determined via the function call
	and the paddle number that is passed in. The ball's initial velocity will be multiplied by the
	direction, causing it to go the opposite way from the player that has just scored.*/
	this.pointScored = function(paddle)
	{
		exitLevelSound.play();
		console.log("Player " + paddle + " Scored!");
		var direction;
		switch(paddle)
		{
			case 1:
				player[0].score++;
				this.updateScore(0);
				direction = 1;
				break;
			case 2:
				player[1].score++;
				this.updateScore(1);
				direction = -1;
				break;
		}

		/*If a player reaches 5 points, set gameOver to true and show that they have won in the html document.*/
		for (var i = 0; i < player.length; i++)
		{
			if (player[i].score >= 5)
			{
				this.gameOver = true;
				document.getElementById("heading").innerHTML = "PLAYER " + (i + 1) + " HAS WON!</br><button id='btn' type='button' onclick='restartGame()'> Restart Game!</button>";
			}
		}

		this.resetObjects(direction)
	}
	//Used to update objects by the time.
	this.update = function(timeElapsed)
	{
		movePaddles(timeElapsed);	//Goes through and passes timeElapsed to Paddle.
		ball.move(timeElapsed);		//Passes timeElapsed to Ball.
	}
	this.render = function()
	{
		//ctx.fillStyle = "#FFFFFF"; //Set the colour of the components within the canvas.
		ctx.clearRect(0, 0, width, height); //Clear the canvas before drawing the next frame.
		ctx.fillStyle = "#39FF14";
		ctx.fillRect(width / 2, 0, 2, height);	//The "net" in the middle of the level.

		//Draw the ball.
		ball.render();

		/*Draws the walls and the players.*/
		for (var i = 0; i < player.length; i++)
		{
			player[i].render();
			wall[i].render();
		}
	}
}
var game = new GameManager();

game.initialiseObjects(); //Calls the initialiseObjects function, setting up the scene.

//Game Loop
var previous; 
function game_loop(timestamp)
{
	/*If the game is over, stop all movement.*/
	if(game.gameOver)
	{
		timeElapsed = 0;
	}
	else 
	{
		/*If there is no previous time, start with no elapsed time.*/
		if (!previous) previous = timestamp;

		var timeElapsed = (timestamp - previous) / 1000;  //Work out the elapsed time.
	}
	
	  
  	game.update(timeElapsed); //Update the game based on elapsed time.
  	 	
  	game.render();	//Renders the game.
	
  	previous = timestamp;  //set the previous timestamp ready for next time
  	requestAnimationFrame(game_loop); //Recursively calls the game loop every animation frame when the browser is ready.
}

requestAnimationFrame(game_loop); //Initial call of the Game Loop.

function restartGame()
{
	game.gameOver = false;
	document.getElementById("heading").innerHTML = "Pong by Joshua Jackson [p16179167]";

	for(var i = 0; i < player.length; i++)
	{
		player[i].score = 0;
		game.updateScore(i);
	}
}