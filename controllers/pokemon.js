const axios = require("axios");
const BadRequestError = require("../utils/errors/BadRequestError");
const NotFoundError = require("../utils/errors/NotFoundError");
const ITEMS_PER_PAGE = 50;

async function getPokemonData(req, res, next) {
  const { type, search, page = 1 } = req.query;

  if (page < 1) {
    return next(new BadRequestError("Page number must be 1 or greater"));
  }

  const offset = (page - 1) * ITEMS_PER_PAGE;

  try {
    const allResponse = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?limit=10000"
    );
    let allPokemon = allResponse.data.results;

    if (type) {
      try {
        const typeResponse = await axios.get(
          `https://pokeapi.co/api/v2/type/${type.toLowerCase()}`
        );
        const typePokemonUrls = new Set(
          typeResponse.data.pokemon.map((p) => p.pokemon.url)
        );
        allPokemon = allPokemon.filter((pokemon) =>
          typePokemonUrls.has(pokemon.url)
        );
      } catch (typeError) {
        console.error("Invalid Pokémon type:", typeError);
        return next(new BadRequestError("Invalid Pokémon type specified"));
      }
    }

    if (search) {
      allPokemon = allPokemon.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // sort alphabetically
    allPokemon.sort((a, b) => a.name.localeCompare(b.name));

    // paginate after filtering and sorting
    const pageData = allPokemon.slice(offset, offset + ITEMS_PER_PAGE);

    if (pageData.length === 0) {
      throw new NotFoundError("No Pokémon found for the specified criteria");
    }

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
    next(new Error("Failed to fetch Pokémon data"));
  }
}

module.exports = { getPokemonData };
