const categoriesCells = Array.from(document.querySelectorAll('.category-cell'));
const gameCells = Array.from(document.querySelectorAll('.game-cell'));
const searchContainer = document.querySelector('.search-game-container');
const cancellButton = document.querySelector('.cancel-button');
const searchDescription = document.querySelector('#searchForm .description');
const searchInput = document.querySelector('#search');

export let lastClickedCellIndex = null; // Variável para armazenar o índice da última célula clicada

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
    let associatedCategories = getCategoriesByCellIndex(cellIndex)
    searchDescription.textContent = `Ache um ${associatedCategories[0].name} e um ${associatedCategories[1].name}`
}

export function getCategoriesByCellIndex(index) {
    let associatedCategories = [];
    switch (index) {
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
    return associatedCategories = [categories[associatedCategories[0]], categories[associatedCategories[1]]]
}

export function submitForm(guid, categories) {
    const url = 'http://localhost:3333/game/verifyAnswer';

    const requestBody = {
        guid: guid,
        categories: categories
    };

    console.log(JSON.stringify(requestBody))
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Define o tipo de conteúdo como JSON
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Converte a resposta para JSON
        })
        .then(data => {
            verifyAnswer(data)
        })
        .catch(error => {
            console.error('Error:', error); // Lida com erros
        });
}

function verifyAnswer(answer) {
    searchContainer.style.display = "none";

    if (answer.answer) {
        const imageUrl = answer.image;
        const clickedCell = gameCells[lastClickedCellIndex];

        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.alt = 'Imagem do jogo';
        imgElement.style.width = '100%'; // Ajusta o tamanho da imagem conforme necessário

        imgElement.classList.add('fade-in-image');
        // Insere a imagem na célula clicada
        clickedCell.appendChild(imgElement);
    } else {
        console.log("Errou")
    }
}