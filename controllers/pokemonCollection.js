const mongoose = require("mongoose");
const PokemonCollection = require("../models/pokemonCollection");
const BadRequestError = require("../utils/errors/BadRequestError");
const NotFoundError = require("../utils/errors/NotFoundError");
const ForbiddenError = require("../utils/errors/ForbiddenError");

// get user pokemon collection
const getUserCollection = (req, res, next) =>
  PokemonCollection.find({ owner: req.user._id })
    .then((collection) => res.send(collection))
    .catch((err) => next(err));

// add pokemon to collection
const addPokemonToCollection = async (req, res, next) => {
  try {
    const { name, type, sprite } = req.body;
    const owner = req.user._id;

    const newPokemon = await PokemonCollection.create({
      name,
      type,
      sprite,
      owner,
    });

    res.status(201).json(newPokemon);
  } catch (error) {
    console.error("Error adding Pokémon to collection:", error);
    next(new BadRequestError("Invalid data for adding Pokémon"));
  }
};

// remove pokemon from collection
const removePokemonFromCollection = (req, res, next) => {
  const { pokemonId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(pokemonId)) {
    return next(new BadRequestError("Invalid Pokémon ID"));
  }

  return PokemonCollection.findById(pokemonId)
    .then((pokemon) => {
      if (!pokemon) {
        throw new NotFoundError("Pokémon not found in your collection");
      }

      if (pokemon.owner.toString() !== req.user._id) {
        throw new ForbiddenError(
          "You do not have permission to remove this Pokémon"
        );
      }

      return PokemonCollection.deleteOne({ _id: pokemonId });
    })
    .then(() =>
      res.status(200).json({ message: "Pokémon removed successfully" })
    )
    .catch((err) => {
      console.error("Error removing Pokémon from collection:", err);
      next(err);
    });
};

module.exports = {
  getUserCollection,
  addPokemonToCollection,
  removePokemonFromCollection,
};
