function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const player = (function(){

    let mark = 0; // 0 = X --- 1 = O

    //Function
    function setMark(index){
        mark = index;
    }

    function getMark(){
        return mark;
    }

    return{
        setMark, 
        getMark
    }

})();

const ai = (function(){

    let aiDifficulty = 0;


    function setDifficulty(value){
        aiDifficulty = value;
    }

    function makeMove(){
        //const choice = _obtainChoice();
        //Temporary random move
        let availablePositions = board.getAvailablePostions();
        let positionToDraw = _getRandomPosition(availablePositions);
        const buttonToDraw = board.getButtons()[positionToDraw];
        board.makeMove(buttonToDraw,positionToDraw);
    }

    function _getRandomPosition(availablePositions){
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        return availablePositions[randomIndex];
    }

    function _obtainChoice(){
       const random = Math.floor(Math.random() * (100 + 1));
       let choice = null;
            
       
    }

    return{
        setDifficulty,
        makeMove
    }

})();

const board = (function(){

    //Variables
    let board = new Array(9).fill(0);
    
    //Catch DOM
    const gameBoard = document.getElementById("game");
    const gameButtons = Array.from(gameBoard.querySelectorAll("button"));

    //Bind events
    gameButtons.forEach((button,index) => {
        button.addEventListener("click", () => {
            if(!game.getGameOver() && !game.getTurn() && board[index] === 0){
                _paintBoard(button,index);
            }
        })
    });

    //Functions
    function _paintBoard(button,index){
        _updateBoard(index);
        mark = document.createElement("label");
        mark.classList.add("mark-label");
        mark.classList.add("visible");
        _drawMark(mark);
        button.appendChild(mark);
        game.checkIfWin();
        if(!game.getTurn() && !game.getGameOver()){
            game.setTurn();
            delay(500).then(() =>{
                ai.makeMove();
                game.setTurn();
            })
        }
    }

    function _updateBoard(index){
        if(!game.getTurn()){
            board[index] = player.getMark() === 0 ? 1 : 2;
        }
        else{
            board[index] = player.getMark() === 0 ? 2 : 1;
        }
    }

    function _drawMark(mark){
        if(!game.getTurn()){
            player.getMark() === 0 ? mark.textContent = "X" : mark.textContent = "O";
        }
        else{
            player.getMark() === 0 ? mark.textContent = "O" : mark.textContent = "X";
        }
    }

    function restartBoard(){
        board.fill(0);
        gameButtons.forEach((box) => {
            const marks = Array.from(box.querySelectorAll("label"));
            marks.forEach(mark => mark.remove());
        });
        let overlay = document.querySelector(".blurred-overlay");
        if (overlay) {
            overlay.remove();
        }
    }

    function getBoardElement(index){
        return board[index];
    }

    function getButtons(){
        return gameButtons;
    }

    function makeMove(button,index){
        if(!game.getGameOver()){
            _paintBoard(button,index);
        }
    }

    function getAvailablePostions(){
        let availablePositions = board.map((value,index) => {
            return value === 0 ? index : -1}).filter((index) => index !== -1);
        return availablePositions;
    }

    return{
        restartBoard, 
        getBoardElement, 
        getButtons, 
        makeMove,
        getAvailablePostions
    };

})();

const options = (function(){

    //Catch DOM
    const mark = document.getElementById("mark");
    const markButtons = Array.from(mark.querySelectorAll("button"));
    const restartButton = document.getElementById("restartButton");
    const difficulty = document.querySelector("select[name=difficulty]");

    //Bind events
    markButtons.forEach((button,index) => {
        button.addEventListener("click", () => {
            if(!game.getGameOver()){
                player.setMark(index);
                board.restartBoard();
                if(index) {
                    if(!game.getTurn()) game.setTurn();
                    delay(500).then(() =>{
                        ai.makeMove();
                        game.setTurn();
                    });
                }
                else{
                    if(game.getTurn()) game.setTurn();
                }
            }
        })
    });

    restartButton.addEventListener("click", () => {
        if(!game.getGameOver()){
            board.restartBoard();
            if(!player.getMark() && game.getTurn()) game.setTurn();
            else if(player.getMark() && !game.getTurn()) game.setTurn();
            if(game.getTurn()){
                delay(500).then(() =>{
                    ai.makeMove();
                    game.setTurn();
                });
            }
        }
    });

    difficulty.addEventListener("change", () => {
        if(!game.getGameOver()){
            ai.setDifficulty(difficulty.value);
        }
    });

})();

const game = (function(){

    //Variables
    let turn = 0; // 0 = player --- 1 = computer
    let gameOver = false;
    let clickEnabled = false;
    const winnerPatterns = [[0,1,2],[0,3,6],[0,4,8],
                            [1,4,7],
                            [2,4,6],[2,5,8],
                            [3,4,5],
                            [6,7,8]];

    //Catch DOM
    const body = document.querySelector("body");

    //Bind events
    document.addEventListener("click", () => {
        if(gameOver && clickEnabled){
            _setAllAtBeginning();
        }
    });

    //Functions
    function checkIfWin(){
        if(!turn) {
            if(!player.getMark()) gameOver = _checkXPatterns();
            else gameOver = _checkOPatterns();
        }
        else{
            if(!player.getMark()) gameOver = _checkOPatterns();
            else gameOver = _checkXPatterns();
        }
        if(gameOver){
            _setWinBackground();
        }
    };

    function _checkXPatterns() {
        return _checkPatterns(1);
    }

    function _checkOPatterns() {
        return _checkPatterns(2);
    }

    function _checkPatterns(number) {
        return winnerPatterns.some((pattern) => pattern.every((move) => board.getBoardElement(move) === number));
    }

    function _setWinBackground(){
        let overlay = document.querySelector(".blurred-overlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.classList.add("blurred-overlay");
            document.body.appendChild(overlay);
            informationWinner = document.createElement("p");
            informationWinner.classList.add("overlay-text");
            informationWinner.textContent = "The WINNER is:";
            overlay.appendChild(informationWinner);
            informationIs = document.createElement("p");
            informationIs.classList.add("overlay-text");
            console.log(turn);
            informationIs.textContent = turn === false ? "YOU!" : "The AI";
            overlay.appendChild(informationIs);

            clickEnabled = false;

            setTimeout(() => {
                clickEnabled = true;
            }, 1000);
        }
    }

    function _setAllAtBeginning(){
        if(gameOver){
            board.restartBoard();
            gameOver = false;
        }
    }

    function setTurn(){
        turn = !turn;
    };

    function getTurn(){
        return turn;
    }

    function getGameOver(){
        return gameOver;
    }

    return{
        checkIfWin,
        setTurn,
        getTurn,
        getGameOver
    };

})();