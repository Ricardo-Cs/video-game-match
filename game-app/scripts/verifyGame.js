function verifyGame(id) {
    fetch(`http://localhost:3333/game/search/${inputValue}`)
        .then(response => response.json())
        .then(data => {
            // Limpar o objeto de sugestões antes de preencher com novos dados
            suggestions = {};

            // Processar a lista de jogos retornada
            data.results.forEach(game => {
                suggestions[game.name] = game.id; // Armazena o nome do jogo como chave e o id como valor
            });

            // Gerar a lista de sugestões
            generateSuggestions(inputValue);
        })
        .catch(error => {
            console.error('Erro:', error);
        });
}