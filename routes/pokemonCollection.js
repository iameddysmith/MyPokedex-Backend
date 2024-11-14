const express = require("express");
const {
  getUserCollection,
  addPokemonToCollection,
  removePokemonFromCollection,
} = require("../controllers/pokemonCollection");
const auth = require("../middlewares/auth");

const router = express.Router();

router.use(auth);

router.get("/", getUserCollection);
router.post("/", addPokemonToCollection);
router.delete("/:pokemonId", removePokemonFromCollection);

module.exports = router;
