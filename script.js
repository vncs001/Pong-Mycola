var firstTouch = true; 

var canvas = document.querySelector('canvas');

var DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};
 
var rounds = [5, 5, 3, 3, 2];
var colors = ['#1abc9c', '#2ecc71', '#3498db', '#8c52ff', '#9b59b6'];
 
// The ball object (The cube that bounces back and forth)
var Ball = {
    new: function (incrementedSpeed) {
        return {
            width: 10,  
            height: 10, 
            x: (this.canvas.width / 2) - 5,  
            y: (this.canvas.height / 2) - 5,  
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: incrementedSpeed || 4.2  
        };
    }
};
 
// The ai object (Your enemy)
var Ai = {
    new: function (side) {
        return {
            width: 10,  
            height: 108, 
            x: side === 'left' ? 90 : this.canvas.width - 90,  
            y: (this.canvas.height / 2) - 21,  
            score: 0,
            move: DIRECTION.IDLE,
            speed: 5  
        }; 
    }
};
 
var Game = {
    initialize: function () {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
 
        this.canvas.width = 840;  
        this.canvas.height = 600;  
 
        this.canvas.style.width = (this.canvas.width / 2) + 'px';
        this.canvas.style.height = (this.canvas.height / 2) + 'px';
 
        this.player = Ai.new.call(this, 'left');
        this.ai = Ai.new.call(this, 'right');
        this.ball = Ball.new.call(this);
 
        this.ai.speed = 5;
        this.running = this.over = false;
        this.turn = this.ai;
        this.timer = this.round = 0;
        this.color = '#0c1ea6';
 
        Pong.menu();
        Pong.listen();
    },
 
    endGameMenu: function (text) {
        // Change the canvas font size and color
        Pong.context.font = '45px Courier New';
        Pong.context.fillStyle = this.color;
 
        // Draw the rectangle behind the 'Press any key to begin' text.
        Pong.context.fillRect(
            Pong.canvas.width / 2 - 350,
            Pong.canvas.height / 2 - 48,
            700,
            100
        );
 
        // Change the canvas color;
        Pong.context.fillStyle = '#ffffff';
 
        // Draw the end game menu text ('Game Over' and 'Winner')
        Pong.context.fillText(text,
            Pong.canvas.width / 2,
            Pong.canvas.height / 2 + 15
        );
 
        setTimeout(function () {
            Pong = Object.assign({}, Game);
            Pong.initialize();
        }, 3000);
    },
 
    menu: function () {
        // Draw all the Pong objects in their current state
        Pong.draw();
 
        // Change the canvas font size and color
        this.context.font = '50px Courier New';
        this.context.fillStyle = this.color;
 
        // Draw the rectangle behind the 'Press any key to begin' text.
        this.context.fillRect(
            this.canvas.width / 2 - 350,
            this.canvas.height / 2 - 48,
            700,
            100
        );
 
        // Change the canvas color;
        this.context.fillStyle = '#ffffff';
 
        // Draw the 'press any key to begin' text
        this.context.fillText('Para cima     Para baixo ',
            this.canvas.width / 2,
            this.canvas.height / 2 + 15
        );
    },
 
    // Update all objects (move the player, ai, ball, increment the score, etc.)
    update: function () {
        if (!this.over) {
            // If the ball collides with the bound limits - correct the x and y coords.
            if (this.ball.x <= 0) Pong._resetTurn.call(this, this.ai, this.player);
            if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player, this.ai);
            if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

            // On new serve (start of each turn) move the ball to the correct side
            // and randomize the direction to add some challenge.
            if (Pong._turnDelayIsOver.call(this) && this.turn) {
                this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
                this.turn = null;
            }
 
            // If the player collides with the bound limits, update the x and y coords.
            if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
            else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;
            // Move ball in intended direction based on moveY and moveX values
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1);
            if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
            else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;
 
            // Handle ai (AI) UP and DOWN movement
            if (this.ai.y > this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y -= this.ai.speed / 2;
                else this.ai.y -= this.ai.speed / 4;
            }
            if (this.ai.y < this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y += this.ai.speed / 2;
                else this.ai.y += this.ai.speed / 4;
            }
 
            if (
                this.ball.x <= this.ai.x + this.ai.width &&
                this.ball.x + this.ball.width >= this.ai.x &&
                this.ball.y <= this.ai.y + this.ai.height &&
                this.ball.y + this.ball.height >= this.ai.y
            ) {
                this.ball.x = this.ai.x - this.ball.width;
                this.ball.moveX = DIRECTION.LEFT;
            }



            // Handle ai (AI) wall collision
            if (this.ai.y >= this.canvas.height - this.ai.height) this.ai.y = this.canvas.height - this.ai.height;
            else if (this.ai.y <= 0) this.ai.y = 0; 
 
            // Handle Player-Ball collisions
            if (
                this.ball.x <= this.player.x + this.player.width &&
                this.ball.x + this.ball.width >= this.player.x &&
                this.ball.y <= this.player.y + this.player.height &&
                this.ball.y + this.ball.height >= this.player.y
            ) {
                this.ball.x = this.player.x + this.player.width;
                this.ball.moveX = DIRECTION.RIGHT;
            }
 
            // Handle ai-ball collision
            if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
                if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
                    this.ball.x = (this.player.x + this.ball.width);
                    this.ball.moveX = DIRECTION.RIGHT;
                }
            }
        
        }
 
        // Handle the end of round transition
        // Check to see if the player won the round.
        if (this.player.score === rounds[this.round]) {
            // Check to see if there are any more rounds/levels left and display the victory screen if
            // there are not.
            if (!rounds[this.round + 1]) {
                this.over = true;
                setTimeout(function () { Pong.endGameMenu('Winner!'); }, 1000);
            } else {
                // If there is another round, reset all the values and increment the round number.
                this.color = this._generateRoundColor();
                this.player.score = this.ai.score = 0;
                this.player.speed += 0.5;
                this.ai.speed += 1;
                this.ball.speed += 1;
                this.round += 1;
            }
        }
        // Check to see if the ai/AI has won the round.
        else if (this.ai.score === rounds[this.round]) {
            this.over = true;
            setTimeout(function () { Pong.endGameMenu('Game Over!'); }, 1000);
        }
    },
 
    // Draw the objects to the canvas element
    draw: function () {
        // Clear the Canvas
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
 
        // Set the fill style to black
        this.context.fillStyle = this.color;
 
        // Draw the background
        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
 
        // Set the fill style to white (For the paddles and the ball)
        this.context.fillStyle = '#ffffff';
 
        // Draw the Player
        this.context.fillRect(
            this.player.x,
            this.player.y,
            10,  
            108  
        );
        // Draw the Ai
        this.context.fillRect(
            this.ai.x,
            this.ai.y,
            10,  
            108  
        );
 
        // Draw the Ball
        if (Pong._turnDelayIsOver.call(this)) {
            this.context.fillRect(
                this.ball.x,
                this.ball.y,
                10,  
                10  
            );
            
        }
 
        // Draw the net (Line in the middle)
        this.context.beginPath();
        this.context.setLineDash([7, 15]);
        this.context.moveTo((this.canvas.width / 2), this.canvas.height - 84);  
        this.context.lineTo((this.canvas.width / 2), 84);  
        this.context.lineWidth = 6; 
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();
 
        // Set the default canvas font and align it to the center
        this.context.font = '60px Courier New';  
        this.context.font = '18px Courier New';  
        this.context.font = '24px Courier';  
        this.context.textAlign = 'center';
 
        // Draw the players score (left)
        this.context.fillText(
            this.player.score.toString(),
            (this.canvas.width / 2) - 300,
            200
        );
 
        // Draw the paddles score (right)
        this.context.fillText(
            this.ai.score.toString(),
            (this.canvas.width / 2) + 300,
            200
        );
 
        // Change the font size for the center score text
        this.context.font = '30px Courier New';
 
        // Draw the winning score (center)
        this.context.fillText(
            'Round ' + (Pong.round + 1),
            (this.canvas.width / 2),
            35
        );
 
        // Change the font size for the center score value
        this.context.font = '40px Courier';
 
        // Draw the current round number
        this.context.fillText(
            rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1],
            (this.canvas.width / 2),
            100
        );
    },
 
    loop: function () {
        Pong.update();
        Pong.draw();
 
        if (!Pong.over) requestAnimationFrame(Pong.loop);
    },
 
    listen: function () {
        var canvas = document.querySelector('canvas');

        canvas.addEventListener('touchstart', function (event) {
            handleTouch(event.touches[0]);
        });

var firstTouch = true;  //First touch

canvas.addEventListener('touchstart', function (event) {
    if (firstTouch) {
        Pong.running = true;
        window.requestAnimationFrame(Pong.loop);
        firstTouch = false;
    }

    handleTouch(event.touches[0]);
});

canvas.addEventListener('touchmove', function (event) {
    handleTouch(event.touches[0]);
});

canvas.addEventListener('touchend', function () {
    Pong.player.move = DIRECTION.IDLE;
});

function handleTouch(touch) {
    // Touch position X
    var toqueX = touch.clientX;

    // Moving the playes
    if (toqueX < canvas.width / 3.3) {
        Pong.player.move = DIRECTION.UP;
    }
    // Mova o jogador para baixo se o toque estiver no lado direito da tela
    else {
        Pong.player.move = DIRECTION.DOWN;
    }
}

    },
 
    // Reset the ball location, the player turns and set a delay before the next round begins.
    _resetTurn: function (victor, loser) {
        this.ball = Ball.new.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = (new Date()).getTime();
 
        victor.score++;
    },
 
    // Wait for a delay to have passed after each turn.
    _turnDelayIsOver: function () {
        return ((new Date()).getTime() - this.timer >= 1000);
    },
 
    // Select a random color as the background of each level/round.
    _generateRoundColor: function () {
        var newColor = colors[Math.floor(Math.random() * colors.length)];
        if (newColor === this.color) return Pong._generateRoundColor();
        return newColor;
    }
};
 
var Pong = Object.assign({}, Game);
Pong.initialize();
