const express = require("express");
const { loginUser, registerUser } = require("../controllers/users");
const pokemonRouter = require("./pokemon");
const userRouter = require("./users");
const pokemonCollectionRouter = require("./pokemonCollection");
const {
  validateUserLogin,
  validateCreateUser,
} = require("../middlewares/validation");

const router = express.Router();

// auth login - register
router.post("/signin", validateUserLogin, loginUser);
router.post("/signup", validateCreateUser, registerUser);

// pokemon api
router.use("/pokemon", pokemonRouter);

// users
router.use("/users", userRouter);

//user pokemon collection
router.use("/pokemon-collection", pokemonCollectionRouter);

// unknown-error
router.use((req, res, next) => {
  res.status(404).json({ message: "Requested resource not found" });
});

module.exports = router;
