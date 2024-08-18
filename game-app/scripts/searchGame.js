const input = document.querySelector('#search');
const form = document.querySelector('#searchForm');

let suggestions = []; // Inicialmente vazio, será preenchido com os nomes dos jogos retornados pela API
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
                console.log(data)
                // Limpar o array de sugestões antes de preencher com novos dados
                suggestions = [];

                // Processar a lista de jogos retornada
                data.results.forEach(game => {
                    suggestions.push(game.name);
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
    const listContainer = document.createElement('div');
    listContainer.setAttribute('class', 'autocomplete-items');
    input.parentNode.appendChild(listContainer);

    // Filtrar sugestões com base no valor do input
    suggestions.forEach(function (suggestion) {
        if (suggestion.toLowerCase().includes(inputValue.toLowerCase())) {
            const item = document.createElement('div');
            item.setAttribute('class', 'autocomplete-item');
            item.innerHTML = suggestion;

            // Quando o usuário clica na sugestão, o campo de input é preenchido e o formulário é submetido
            item.addEventListener('click', function () {
                input.value = suggestion;
                closeAllLists();
                form.submit(); // Submete o formulário
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
