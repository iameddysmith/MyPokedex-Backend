const express = require("express");
const { getUser, updateUser } = require("../controllers/users");

const userRouter = express.Router();

userRouter.get("/:id", getUser);
userRouter.patch("/:id", updateUser);

module.exports = userRouter;
