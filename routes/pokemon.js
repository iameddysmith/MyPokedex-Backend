const express = require("express");
const { getPokemonData } = require("../controllers/pokemon");
//poke route
const router = express.Router();

router.get("/", getPokemonData);

module.exports = router;
