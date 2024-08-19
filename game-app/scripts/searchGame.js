const input = document.querySelector('#search');
const form = document.querySelector('#searchForm');

let suggestions = {}; // Objeto para armazenar as sugestões e seus GUIDs
let debounceTimeout;

input.addEventListener('input', (e) => {
    e.preventDefault();
    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
        const inputValue = input.value;

        // Fechar quaisquer listas de sugestões abertas anteriormente
        closeAllLists();

        if (!inputValue) return false;

        // Fazer a requisição à API
        fetch(`http://localhost:3333/game/search/${inputValue}`)
            .then(response => response.json())
            .then(data => {
                // Limpar o objeto de sugestões antes de preencher com novos dados
                suggestions = {};

                // Processar a lista de jogos retornada
                data.results.forEach(game => {
                    suggestions[game.name] = game.guid; // Armazena o nome do jogo como chave e o guid como valor
                });

                // Gerar a lista de sugestões
                generateSuggestions(inputValue);
            })
            .catch(error => {
                console.error('Erro:', error);
            });
    }, 300); // Ajuste o tempo de debounce conforme necessário
});

function generateSuggestions(inputValue) {
    // Verifica se já existe uma div de sugestões, se sim, remove-a
    const existingListContainer = document.querySelector('.autocomplete-items');
    if (existingListContainer) {
        existingListContainer.remove();
    }

    const listContainer = document.createElement('div');
    listContainer.setAttribute('class', 'autocomplete-items');
    input.parentNode.appendChild(listContainer);

    // Filtrar sugestões com base no valor do input
    Object.keys(suggestions).forEach(function (suggestion) {
        if (suggestion.toLowerCase().includes(inputValue.toLowerCase())) {
            const item = document.createElement('div');
            item.setAttribute('class', 'autocomplete-item');
            item.innerHTML = suggestion;

            // Quando o usuário clica na sugestão, o campo de input é preenchido e o GUID é logado
            item.addEventListener('click', function () {
                input.value = suggestion;
                const selectedGuid = suggestions[suggestion];
                closeAllLists();
                form.submit();
            });

            listContainer.appendChild(item);
        }
    });
}

// Função para fechar todas as listas de sugestões
function closeAllLists() {
    const items = document.getElementsByClassName('autocomplete-items');
    for (let i = 0; i < items.length; i++) {
        items[i].parentNode.removeChild(items[i]);
    }
}

// Fechar a lista de sugestões quando o usuário clica fora do campo de input
document.addEventListener('click', function (e) {
    closeAllLists(e.target);
});
