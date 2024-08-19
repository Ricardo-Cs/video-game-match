const categoriesCells = Array.from(document.querySelectorAll('.category-cell'));
const gameCells = Array.from(document.querySelectorAll('.game-cell'));
const searchContainer = document.querySelector('.search-game-container');
const cancellButton = document.querySelector('.cancel-button');
const searchDescription = document.querySelector('#searchForm .description');
const searchInput = document.querySelector('#search');

let lastClickedCellIndex = null; // Variável para armazenar o índice da última célula clicada

// Event Listeners e chamada de funções
gameCells.forEach((cell) => {
    cell.addEventListener('click', (event) => { hideAndShowSearchBox(event) });
});

cancellButton.addEventListener('click', (e) => {
    e.preventDefault();
    searchContainer.style.display = "none";
});

loadCategories();

// Função para carregar as categorias do localStorage
function loadCategories() {
    const categories = JSON.parse(sessionStorage.getItem('gameCategories'));
    categoriesCells.forEach((cell, index) => {
        if (categories && categories[index]) {
            cell.textContent = categories[index].name; // Insere o nome da categoria na célula
        }
    });
}

function hideAndShowSearchBox(event) {
    searchInput.value = "";
    const cell = event.target;
    const cellIndex = gameCells.indexOf(cell);

    // Verifica se o usuário clicou na mesma célula
    if (cellIndex === lastClickedCellIndex) {
        searchContainer.style.display = "none";
        lastClickedCellIndex = null; // Reset para o próximo clique
    } else {
        searchContainer.style.display = "block";
        searchInput.focus();
        lastClickedCellIndex = cellIndex; // Atualiza a célula clicada
    }

    let associatedCategories = [];
    switch (cellIndex) {
        case 0:
            associatedCategories = [0, 3];
            break;
        case 1:
            associatedCategories = [1, 3];
            break;
        case 2:
            associatedCategories = [2, 3];
            break;
        case 3:
            associatedCategories = [0, 4];
            break;
        case 4:
            associatedCategories = [1, 4];
            break;
        case 5:
            associatedCategories = [2, 4];
            break;
        case 6:
            associatedCategories = [0, 5];
            break;
        case 7:
            associatedCategories = [1, 5];
            break;
        case 8:
            associatedCategories = [2, 5];
            break;
        default:
            break;
    }
    const categories = JSON.parse(sessionStorage.getItem('gameCategories'));
    associatedCategories = [categories[associatedCategories[0]], categories[associatedCategories[1]]]
    searchDescription.textContent = `Ache um ${associatedCategories[0].name} e um ${associatedCategories[1].name}`

    console.log(associatedCategories)
}
