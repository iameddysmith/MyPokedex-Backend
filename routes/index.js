const express = require("express");
const pokemonRouter = require("./pokemon");

const router = express.Router();

router.use("/pokemon", pokemonRouter);

module.exports = router;
