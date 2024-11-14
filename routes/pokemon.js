const express = require("express");
const { getPokemonData } = require("../controllers/pokemon");

const router = express.Router();

router.get("/", getPokemonData);

module.exports = router;
