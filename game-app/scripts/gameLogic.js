const cells = Array.from(document.querySelectorAll('[data-cell]'));
let currentPlayer = 'X';

cells.forEach(cell => {
    cell.addEventListener('click', changeState);
});

function changeState(event) {
    const cell = event.target;

    if (cell.classList.contains('cell-X') || cell.classList.contains('cell-O')) {
        return; // Célula já marcada, não faz nada
    }

    cell.classList.remove('cell-none');
    cell.classList.add(`cell-${currentPlayer}`);
    cell.textContent = currentPlayer;

    if (checkWin(currentPlayer)) {
        alert(`${currentPlayer} wins!`);
        return;
    }

    if (checkDraw()) {
        alert("Velha!");
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

function checkWin(player) {
    const winPatterns = [
        [0, 1, 2], // Linha superior
        [3, 4, 5], // Linha do meio
        [6, 7, 8], // Linha inferior
        [0, 3, 6], // Coluna esquerda
        [1, 4, 7], // Coluna do meio
        [2, 5, 8], // Coluna direita
        [0, 4, 8], // Diagonal principal
        [2, 4, 6]  // Diagonal secundária
    ];

    return winPatterns.some(pattern => {
        return pattern.every(index => cells[index].classList.contains(`cell-${player}`));
    });
}

function checkDraw() {
    // Verifica se todas as células estão preenchidas e nenhum jogador ganhou
    return cells.every(cell => cell.classList.contains('cell-X') || cell.classList.contains('cell-O'));
}
