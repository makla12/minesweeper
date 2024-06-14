//Variables
const board = document.getElementById("gameBoard");
board.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});
let rows = 34, colums = 60, mines = 300, time = 0, timer, cells, digCount;

const easy = () => {
    document.getElementById("rows").value = 34;
    document.getElementById("colums").value = 40;
    document.getElementById("mines").value = 100;
}

const medium = () => {
    document.getElementById("rows").value = 34;
    document.getElementById("colums").value = 40;
    document.getElementById("mines").value = 200;
}

const hard = () => {
    document.getElementById("rows").value = 34;
    document.getElementById("colums").value = 40;
    document.getElementById("mines").value = 300;
}

const gameSetup = () => {
    rows = Number(document.getElementById("rows").value);
    colums = Number(document.getElementById("colums").value);
    mines = Number(document.getElementById("mines").value);
    if(rows * colums - 9  < 9){
        alert("You must have room for at least 9 non mine cells");
        return 0;
    }
    document.getElementById("dificulty").style.display = "none";
    document.getElementById("game").style.display = "block";
    startGame();
}

//Generate board
const startGame = () =>{
    board.innerHTML = "";
    document.getElementById("mineCounter").textContent = mines;
    cells = [];
    digCount = 0;
    for(let i = 0; i < rows; i++){
        cells.push([]);
        let row = document.createElement("div");
        row.classList.add("row");
        for(let j = 0; j < colums; j++){
            cells[i].push(
                {
                    value:0,
                    flaged:false,
                    cleared:false,
                    row:i,
                    col:j
                }
            );
            let cellDiv = document.createElement("div");
            cellDiv.classList.add("cellDiv");
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.id = `${i};${j}`;
            cell.onclick = () => {easyDig(i,j);easyFlag(i,j);handleDig(i,j);}
            cell.oncontextmenu = () => flag(i,j);
            cellDiv.appendChild(cell);
            let cellT = document.createElement("span");
            cellT.id = `${i};${j}T`;
            cellDiv.appendChild(cellT);
            row.appendChild(cellDiv);
        }
        board.appendChild(row);
    }
    board.style.width = colums * 37 + "px";
}

//Timer
const formatTime = (x) => {
    let sec = time % 60;
    let min = Math.floor((time / 60) % 60);
    let h = Math.floor(time / 3600);
    return `${h != 0 ? h + "h" : ""} ${min != 0 ? min + "m" : ""} ${sec}s`;
}
const startTimer = () =>{
    time = 0;
    document.getElementById("time").innerHTML = "0s"
    clearInterval(timer);
    timer = setInterval(() => {
        time++;
        document.getElementById("time").innerHTML = formatTime(time);
    },1000);
}
const stopTimer = () => {
    clearInterval(timer);
}

const cellsAround = (x,y) => {
    let cellsAr = [];
    if(x != 0){
        cellsAr.push(cells[x-1][y]);
        if(y != 0) cellsAr.push(cells[x-1][y-1]);
        if(y != colums - 1) cellsAr.push(cells[x-1][y+1]);
    }
    if(x != rows - 1){
        cellsAr.push(cells[x+1][y]);
        if(y != 0) cellsAr.push(cells[x+1][y-1]);
        if(y != colums - 1) cellsAr.push(cells[x+1][y+1]);
    }
    if(y != 0) cellsAr.push(cells[x][y-1]);
    if(y != colums - 1) cellsAr.push(cells[x][y+1]);
    return cellsAr;
}

const cacculateMinesAround = (x,y) => {
    let sum = 0;
    for(let i of cellsAround(x,y)){
        if(i.value == -1) sum++;
    }
    return sum;
}

const generateMines = () =>{
    for(let i = 0; i < mines;){
        let row = Math.floor(Math.random() * rows);
        let colum = Math.floor(Math.random() * colums);
        if(cells[row][colum].value != -1){
            cells[row][colum].value = -1;
            i++;
        }
    }
}

const updateValue = () => {
    for(let i = 0; i < rows; i++){
        for(let j = 0; j < colums; j++){
            if(cells[i][j].value != -1){
                cells[i][j].value = cacculateMinesAround(i,j);
            }
        }   
    }
}

const dig = (x,y) => {
    if(digCount == 0){
        cells[x][y].value = -1;
        for(let i of cellsAround(x,y)){
            cells[i.row][i.col].value = -1;
        }
        generateMines();
        cells[x][y].value = 0;
        for(let i of cellsAround(x,y)){
            cells[i.row][i.col].value = 0;
        }
        updateValue();
        startTimer();
    }
    if(cells[x][y].flaged || cells[x][y].cleared) return 0;

    if(cells[x][y].value == -1) return -1;
    
    digCount++;
    let cell = document.getElementById(`${x};${y}`);
    cell.className = "cellCleared";
    cell.style.animationName = "dig";
    document.getElementById(`${x};${y}T`).innerHTML = cells[x][y].value;
    cells[x][y].cleared = true;
    if(cells[x][y].value == 0){
        document.getElementById(`${x};${y}T`).innerHTML = "";
        for(let i of cellsAround(x,y)){
            dig(i.row,i.col);
        }
    }
    if(rows * colums - digCount == mines){
        win();
    }
    return 1;
}

const flag = (x,y) => {
    if(cells[x][y].cleared) return 0;
    let cell = document.getElementById(`${x};${y}`);
    if(!cells[x][y].flaged){
        cell.className = "cellFlaged";
        cell.style.animationName = "flag";
        cell.innerHTML = "<img src='images/flag.png' width = 80%>";
        cells[x][y].flaged = true;
        document.getElementById("mineCounter").innerHTML = Number(document.getElementById("mineCounter").innerHTML) - 1;
    }
    else{
        cell.className = "cell";
        cell.style.animationName = "deflag";
        cell.innerHTML = "";
        cells[x][y].flaged = false;
        document.getElementById("mineCounter").innerHTML = Number(document.getElementById("mineCounter").innerHTML) + 1;
    }
}

const easyDig = (x,y) => {
    if(!cells[x][y].cleared) return 0;
    let cellAr = cellsAround(x,y);
    if(cellAr.filter((x)=>x.flaged).length == cells[x][y].value){
        for(let i of cellsAround(x,y)) handleDig(i.row,i.col);
    }
}

const easyFlag = (x,y) => {
    if(!cells[x][y].cleared) return 0;
    let cellAr = cellsAround(x,y);
    if(cellAr.filter((x)=>!x.cleared).length == cells[x][y].value){
        for(let i of cellAr.filter((x) => !x.flaged)) flag(i.row,i.col);
    }
}
const handleDig = (x,y) => {
    if(dig(x,y) == -1) lose();
}

const win = () => {
    stopTimer();
    document.getElementById("timeEnd").innerHTML = formatTime(time);
    document.getElementById("winAlert").style.display = "flex";
}

const lose = () => {
    stopTimer();
    document.getElementById("loseAlert").style.display = "flex";
}