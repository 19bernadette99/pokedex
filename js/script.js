window.addEventListener('load', function () {
    let progressBar = document.getElementById('progress-bar');
    let width = 0;
    let interval = setInterval(function () {
        if (width >= 100) {
            clearInterval(interval);
            document.getElementById('preloader').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            document.getElementById('main-content').style.opacity = 1;
        } else {
            width++;
            progressBar.style.width = width + '%';
        }
    }, 20);
});

let offset = 0; 
const limit = 30; 
let allPokemon = [];
let loadedPokemonIds = new Set(); 

fetchPokemonList();

async function loadAllPokemon() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0');
        const data = await response.json();
        allPokemon = data.results; 
        displayPokemon(allPokemon); 
    } catch (error) {
    }
}

loadAllPokemon();

function fetchPokemonList(append = false) {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    fetch(url)
        .then(response => response.json())
        .then(data => Promise.all(data.results.map(pokemon => fetchPokemonData(pokemon.url))))
        .then(newPokemonData => displayPokemon(newPokemonData.filter(Boolean), append))
}

async function fetchPokemonData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!data.types || !data.sprites) {
            return null;
        }
        return data; 
    } catch (error) {
        return null;
    }
}

async function fetchPokemonDetails(query) {
    const url = `https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
        }
        const pokemonData = await response.json();
        if (!pokemonData) {
            return null;
        }
        return pokemonData;
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

function fetchMorePokemon(pokemonList) {
    const pokemonDetailsPromises = pokemonList.map(pokemon =>
        fetch(pokemon.url).then(response => response.json())
    );

    Promise.all(pokemonDetailsPromises)
        .then(pokemonData => {
            pokemonData.forEach(data => pokemonArray.push(data));
            displayPokemon(pokemonArray, true);
        })
}

function createPokemonCardElement(pokemon, firstType, bgColor, imageUrl, name, pokemonArray) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card', `type-${firstType}`);
    card.setAttribute('data-id', pokemon.id);
    card.innerHTML = createPokemonCard(pokemon, bgColor, imageUrl, name, firstType);
    if (name.length > 12) card.querySelector('.pokemon-name').style.fontSize = '12px';
    card.addEventListener('click', () => openOverlay(pokemon, pokemonArray, pokemonArray.indexOf(pokemon)));
    return card;
}

function displayPokemon(pokemonArray, append = false) {
    const container = document.getElementById('pokemon-list');
    if (!container) {
        return;  }
    if (!append) container.innerHTML = ''; 
    if (!Array.isArray(pokemonArray) || pokemonArray.length === 0) {
    
        container.innerHTML = '<p class="no-results">Keine Pokémon gefunden!</p>';
        return; }
    pokemonArray.forEach(pokemon => {
        if (!pokemon || !pokemon.types || !pokemon.sprites) {
            return; }
        const types = pokemon.types && pokemon.types.length > 0 ? pokemon.types : [{ type: { name: 'unknown' } }];
        const { name, sprites } = pokemon;
        const firstType = types[0]?.type?.name || 'unknown';
        const bgColor = typeColors[firstType] || '#A8A878'; 
        const imageUrl = sprites?.front_default || '';
        const card = createPokemonCardElement(pokemon, firstType, bgColor, imageUrl, name, pokemonArray);
        container.appendChild(card);
    });
}

document.getElementById('search').addEventListener('input', function (event) {
    const query = event.target.value.trim().toLowerCase();
    if (query.length >= 2) {
        handleSearch(query);
    } else if (query.length === 0) {
        resetSearch();
    }
});

function handleSearch(query) {
    const loadMoreButton = document.getElementById('load-more-btn');
    if (loadMoreButton) loadMoreButton.style.display = 'none';
    let filteredPokemon = filterPokemon(query);
    if (filteredPokemon.length) fetchPokemonDetails(filteredPokemon);
    else showNoResults();
}

function filterPokemon(query) {
    let result = allPokemon.filter(pokemon => pokemon.name.toLowerCase().includes(query));
    if (result.length === 0 && !isNaN(query)) result = findPokemonById(query);
    return result.slice(0);
}

function findPokemonById(query) {
    return allPokemon.filter(pokemon => pokemon.url.split('/').slice(-2, -1)[0] === query);
}

function fetchPokemonDetails(filteredPokemon) {
    const promises = filteredPokemon.map(pokemon => fetch(pokemon.url).then(res => res.json()));
    Promise.all(promises).then(displayPokemon).catch(console.error);
}

async function resetSearch() {

    offset = 0; 
    const limit = 30;  

    try {
        const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
        const response = await fetch(url);
        const data = await response.json();
        const pokemonList = data.results;
        const detailedPokemonList = await Promise.all(pokemonList.map(pokemon => fetchPokemonData(pokemon.url)));
        displayPokemon(detailedPokemonList);
        const loadMoreButton = document.getElementById('load-more-btn');
    if (loadMoreButton) {
            loadMoreButton.style.display = 'block';
        }
    } catch (error) {
     
    }
}

function filteredPokemon(criteria = {}) {
    const { type, name } = criteria;
    const filteredPokemon = allPokemon.filter(pokemon => {
        const matchesName = name ? pokemon.name.toLowerCase().includes(name.toLowerCase()) : true;
        const matchesType = type
            ? pokemon.types.some(t => t.type.name.toLowerCase() === type.toLowerCase())
            : true;
        return matchesName && matchesType;
    });

    displayPokemon(filteredPokemon);
}


function showNoResults() {
    const container = document.getElementById('pokemon-list');
    container.innerHTML = '<p>Keine Pokémon gefunden.</p>';
}

function openOverlay(pokemon, pokemonList, currentIndex) {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.classList.add('no-scroll');
    const pokemonDetails = createPokemonDetails(pokemon);
    overlay.innerHTML = pokemonDetails;
    document.body.appendChild(overlay);
    setStatBarWidths(pokemon);
    overlay.querySelector('.close-btn').addEventListener('click', closeOverlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });
    addNavigationArrows(overlay, pokemonList, currentIndex);
}

function setStatBarWidths(pokemon) {
    setTimeout(() => {
        const statBars = document.querySelectorAll('.stat-bar-fill');
        statBars.forEach((bar, index) => {
            const value = pokemon.stats[index].base_stat;
            bar.style.width = `${value * 2}px`;
        });
    }, 100);
}

function addNavigationArrows(overlay, pokemonList, currentIndex) {
    const leftArrow = overlay.querySelector('.left-arrow');
    const rightArrow = overlay.querySelector('.right-arrow');
    leftArrow.addEventListener('click', () => {
        const prevIndex = (currentIndex - 1 + pokemonList.length) % pokemonList.length;
        closeOverlay();
        openOverlay(pokemonList[prevIndex], pokemonList, prevIndex);
    });
    rightArrow.addEventListener('click', () => {
        const nextIndex = (currentIndex + 1) % pokemonList.length;
        closeOverlay();
        openOverlay(pokemonList[nextIndex], pokemonList, nextIndex);
    });
}

function closeOverlay() {
    const overlay = document.querySelector('.overlay');
    if (overlay) overlay.remove();
    document.body.classList.remove('no-scroll');
}

document.getElementById('load-more-btn').addEventListener('click', () => {
    showPreloader();
    offset += limit;
    fetchPokemonList(true);
    animateProgressBar(30);
});

function showPreloader() {
    document.getElementById('preloader').style.display = 'flex';
    document.getElementById('main-content').style.display = 'none';
}

function hidePreloader() {
    document.getElementById('preloader').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('main-content').style.opacity = 1;
}

function animateProgressBar(intervalTime) {
    let progressBar = document.getElementById('progress-bar');
    let width = 0;
    let interval = setInterval(function () {
        if (width >= 100) {
            clearInterval(interval);
            hidePreloader();
        } else {
            width++;
            progressBar.style.width = width + '%';
        }
    }, intervalTime);
}

const scrollUpBtn = document.getElementById('scroll-up-btn');
window.addEventListener('scroll', () => {
    scrollUpBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
});
scrollUpBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


