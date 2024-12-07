const typeColors = {
    grass: '#78C850',
    fire: '#F08030',
    water: '#6890F0',
    bug: '#A8B820',
    poison: '#A040A0',
    electric: '#F8D030',
    ground: '#E0C068',
    fairy: '#EE99AC',
    fighting: '#C03028',
    normal: '#A8A878',
    psychic: '#F85888',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    ice: '#98D8D8',
    steel: '#B8B8D0',
    flying: '#A890F0'
};

function createPokemonCard(pokemon, bgColor, pokemonImageUrl, firstType) {
    return `
        <div class="pokemon-id">#${pokemon.id}</div>
        <p class="pokemon-name">${pokemon.name}</p>
        <div class="pokemon-image-container" style="background-color: ${bgColor};">
            <img src="${pokemonImageUrl}" alt="${pokemon.name}">
        </div>
        <div class="pokemon-types">
            <button class="type-button">${firstType}</button>
        </div>
    `;
}

function createPokemonDetails(pokemon) {
    const firstType = pokemon.types?.[0]?.type.name || 'unknown';
    const bgColor = typeColors[firstType] || '#A8A878';
    return `
        <div class="overlay-content">
            <span class="close-btn">×</span>
            <div class="pokemon-id">#${pokemon.id}</div>
            <div class="navigation-arrows">
                <button class="arrow-btn left-arrow">←</button>
                <h2>${pokemon.name}</h2>
                <button class="arrow-btn right-arrow">→</button>
            </div>
            <div class="pokemon-image-container-overlay" style="background-color: ${bgColor};">
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            </div>
            <div class="details-container stats-container">
                ${pokemon.stats.map(stat => `
                    <div class="stat-item">
                        <span class="stat-name">${stat.stat.name}</span>
                        <div class="stat-bar">
                            <div class="stat-bar-fill" style="width: 0%"></div>
                        </div>
                        <span class="stat-value">${stat.base_stat}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

