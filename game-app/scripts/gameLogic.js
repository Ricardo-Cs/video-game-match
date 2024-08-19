const categoriesCells = Array.from(document.querySelectorAll('.category-cell'));

// Função para carregar as categorias do localStorage
function loadCategories() {
    const categories = JSON.parse(sessionStorage.getItem('gameCategories'));
    categoriesCells.forEach((cell, index) => {
        if (categories && categories[index]) {
            cell.textContent = categories[index].name; // Insere o nome da categoria na célula
        }
    });
}

loadCategories();