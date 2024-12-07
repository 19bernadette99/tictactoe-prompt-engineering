let fields = [
    null, null, null,
    null, null, null,
    null, null, null,
];

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6], 
];

let currentPlayer = 'circle';
let gameActive = true;
let isSinglePlayer = false;

function init() {
    render();
    updatePlayerIndicator();
    document.getElementById('mode-selection-overlay').style.display = 'flex';
}

function selectMode(mode) {
    isSinglePlayer = mode === 'single';
    document.getElementById('mode-selection-overlay').style.display = 'none';
    restartGame();
}

function render() {
    const contentDiv = document.getElementById('content');
    let tableHtml = '<table>';
    for (let i = 0; i < 3; i++) {
        tableHtml += '<tr>';
        for (let j = 0; j < 3; j++) {
            const index = i * 3 + j;
            let symbol = '';
            if (fields[index] === 'circle') {
                symbol = generateCircleSVG();
            } else if (fields[index] === 'cross') {
                symbol = generateCrossSVG();
            }
            tableHtml += `<td onclick="handleClick(this, ${index})">${symbol}</td>`;
        }
        tableHtml += '</tr>';
    }
    tableHtml += '</table>';
    contentDiv.innerHTML = tableHtml;
}

function restartGame() {
    fields = [null, null, null, null, null, null, null, null, null];
    currentPlayer = 'circle';
    gameActive = true;
    render();
    updatePlayerIndicator();
}

function handleClick(cell, index) {
    if (!gameActive || fields[index] !== null) return;

    fields[index] = currentPlayer;
    render();

    const winningCombination = getWinningCombination();
    if (winningCombination) {
        gameActive = false;
        drawWinningLine(winningCombination);
        showWinnerMessage(`${currentPlayer === 'circle' ? 'Kreis' : 'Kreuz'} gewinnt!`);
        return;
    }

    currentPlayer = currentPlayer === 'circle' ? 'cross' : 'circle';
    updatePlayerIndicator();

    if (isSinglePlayer && currentPlayer === 'cross' && gameActive) {
        setTimeout(robotMove, 500); 
    }
}

function robotMove() {
    const emptyFields = fields.map((value, index) => value === null ? index : null).filter(index => index !== null);
    if (emptyFields.length === 0) return;

    const randomIndex = emptyFields[Math.floor(Math.random() * emptyFields.length)];
    fields[randomIndex] = 'cross';
    render();

    const winningCombination = getWinningCombination();
    if (winningCombination) {
        gameActive = false;
        drawWinningLine(winningCombination);
        showWinnerMessage('Kreuz gewinnt!');
    } else {
        currentPlayer = 'circle';
        updatePlayerIndicator();
    }
}

function getWinningCombination() {
    for (const [a, b, c] of WINNING_COMBINATIONS) {
        if (fields[a] && fields[a] === fields[b] && fields[a] === fields[c]) {
            return [a, b, c];
        }
    }
    return null;
}

function generateCircleSVG() {
    const color = '#00B0EF';
    const width = 70;
    const height = 70;
    return `<svg width="${width}" height="${height}">
              <circle cx="35" cy="35" r="30" stroke="${color}" stroke-width="5" fill="none">
                <animate attributeName="stroke-dasharray" from="0 188.5" to="188.5 0" dur="0.2s" fill="freeze" />
              </circle>
            </svg>`;
}

function generateCrossSVG() {
    const color = '#FFC000';
    const width = 70;
    const height = 70;
    return `
      <svg width="${width}" height="${height}">
        <line x1="0" y1="0" x2="${width}" y2="${height}" stroke="${color}" stroke-width="5">
          <animate attributeName="x2" values="0; ${width}" dur="200ms" />
          <animate attributeName="y2" values="0; ${height}" dur="200ms" />
        </line>
        <line x1="${width}" y1="0" x2="0" y2="${height}" stroke="${color}" stroke-width="5">
          <animate attributeName="x2" values="${width}; 0" dur="200ms" />
          <animate attributeName="y2" values="0; ${height}" dur="200ms" />
        </line>
      </svg>`;
}

function drawWinningLine(combination) {
    const lineColor = '#ffffff';
    const lineWidth = 5;

    const startCell = document.querySelectorAll(`td`)[combination[0]];
    const endCell = document.querySelectorAll(`td`)[combination[2]];
    const startRect = startCell.getBoundingClientRect();
    const endRect = endCell.getBoundingClientRect();

    const contentRect = document.getElementById('content').getBoundingClientRect();

    const lineLength = Math.sqrt(
        Math.pow(endRect.left - startRect.left, 2) + Math.pow(endRect.top - startRect.top, 2)
    );
    const lineAngle = Math.atan2(endRect.top - startRect.top, endRect.left - startRect.left);

    const line = document.createElement('div');
    line.style.position = 'absolute';
    line.style.width = `${lineLength}px`;
    line.style.height = `${lineWidth}px`;
    line.style.backgroundColor = lineColor;
    line.style.top = `${startRect.top + startRect.height / 2 - lineWidth / 2 - contentRect.top}px`;
    line.style.left = `${startRect.left + startRect.width / 2 - contentRect.left}px`;
    line.style.transform = `rotate(${lineAngle}rad)`;
    line.style.transformOrigin = `top left`;
    document.getElementById('content').appendChild(line);
}

function updatePlayerIndicator() {
    const circleIndicator = document.getElementById('circle-indicator');
    const crossIndicator = document.getElementById('cross-indicator');

    if (currentPlayer === 'circle') {
        circleIndicator.classList.add('active');
        crossIndicator.classList.remove('active');
    } else {
        crossIndicator.classList.add('active');
        circleIndicator.classList.remove('active');
    }
}

function showWinnerMessage(message) {
    const overlay = document.getElementById('winner-overlay');
    const messageElement = document.getElementById('winner-message');
    messageElement.textContent = message;
    overlay.style.display = 'flex';

    setTimeout(() => {
        overlay.style.display = 'none';
        restartGame();
    }, 3000);
}
