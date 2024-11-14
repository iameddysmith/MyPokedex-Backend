const axios = require("axios");
const ITEMS_PER_PAGE = 50;

async function getPokemonData(req, res) {
  const { type, search, page = 1 } = req.query;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  try {
    // fetch pokemon
    const allResponse = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?limit=10000"
    );
    let allPokemon = allResponse.data.results;

    // filter by type
    if (type) {
      const typeResponse = await axios.get(
        `https://pokeapi.co/api/v2/type/${type.toLowerCase()}`
      );
      const typePokemonUrls = new Set(
        typeResponse.data.pokemon.map((p) => p.pokemon.url)
      );
      allPokemon = allPokemon.filter((pokemon) =>
        typePokemonUrls.has(pokemon.url)
      );
    }

    // search filter
    if (search) {
      allPokemon = allPokemon.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // sort alphabetical
    allPokemon.sort((a, b) => a.name.localeCompare(b.name));

    // paginate after filtering and sorting
    const pageData = allPokemon.slice(offset, offset + ITEMS_PER_PAGE);

    const detailedDataPromises = pageData.map((pokemon) =>
      axios.get(pokemon.url).then((res) => ({
        name: res.data.name,
        id: res.data.id,
        sprite: res.data.sprites.front_default,
        types: res.data.types.map((type) => type.type.name),
      }))
    );

    const detailedData = await Promise.all(detailedDataPromises);

    res.json({ pokemon: detailedData, totalResults: allPokemon.length });
  } catch (error) {
    console.error("Failed to fetch Pokémon data:", error);
    res.status(500).json({ message: "Failed to fetch Pokémon data" });
  }
}

module.exports = { getPokemonData };
