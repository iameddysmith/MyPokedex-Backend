const https = require("https");
const BadRequestError = require("../utils/errors/BadRequestError");
const ITEMS_PER_PAGE = 50;

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });
}

async function getPokemonData(req, res, next) {
  const { type, search, page = 1 } = req.query;

  if (page < 1) {
    return next(new BadRequestError("Page number must be 1 or greater"));
  }

  const offset = (page - 1) * ITEMS_PER_PAGE;

  try {
    const allResponse = await fetchJSON(
      "https://pokeapi.co/api/v2/pokemon?limit=10000"
    );
    let allPokemon = allResponse.results;

    if (type) {
      try {
        const typeResponse = await fetchJSON(
          `https://pokeapi.co/api/v2/type/${type.toLowerCase()}`
        );
        const typePokemonUrls = new Set(
          typeResponse.pokemon.map((p) => p.pokemon.url)
        );
        allPokemon = allPokemon.filter((pokemon) =>
          typePokemonUrls.has(pokemon.url)
        );
      } catch (err) {
        console.error("Invalid Pokémon type:", err);
        return next(new BadRequestError("Invalid Pokémon type specified"));
      }
    }

    if (search) {
      allPokemon = allPokemon.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (allPokemon.length === 0) {
      return res.json({ pokemon: [], totalResults: 0 });
    }

    // sort alphabetically
    allPokemon.sort((a, b) => a.name.localeCompare(b.name));

    // paginate after filtering and sorting
    const pageData = allPokemon.slice(offset, offset + ITEMS_PER_PAGE);

    if (pageData.length === 0) {
      return res.json({ pokemon: [], totalResults: allPokemon.length });
    }

    const detailedData = await Promise.all(
      pageData.map(async (pokemon) => {
        const pokemonResponse = await fetchJSON(pokemon.url);
        return {
          name: pokemonResponse.name,
          id: pokemonResponse.id,
          sprite: pokemonResponse.sprites.front_default,
          types: pokemonResponse.types.map((type) => type.type.name),
        };
      })
    );

    res.json({
      pokemon: detailedData,
      totalResults: allPokemon.length,
    });
  } catch (error) {
    console.error("Failed to fetch Pokémon data:", error);
    next(new Error("Failed to fetch Pokémon data"));
  }
}

module.exports = { getPokemonData };
