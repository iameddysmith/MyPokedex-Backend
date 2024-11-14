const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const BadRequestError = require("../utils/errors/BadRequestError");
const NotFoundError = require("../utils/errors/NotFoundError");

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      throw new NotFoundError("User not found");
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;

    // update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    res.json({ name: updatedUser.name, avatar: updatedUser.avatar });
  } catch (error) {
    console.error("Error updating profile:", error);
    next(new BadRequestError("Error updating profile"));
  }
};

// register user
const registerUser = async (req, res, next) => {
  try {
    const { email, password, name, avatar } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      avatar,
    });

    res
      .status(201)
      .json({ email: user.email, name: user.name, avatar: user.avatar });
  } catch (error) {
    console.error("Error during registration:", error);
    next(new BadRequestError("Registration failed"));
  }
};

// login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: "Incorrect email or password" });
  }
};

module.exports = { registerUser, loginUser, getCurrentUser, updateProfile };
