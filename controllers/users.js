const login = (req, res) => {
  res.send("User login successful");
};

const createUser = (req, res) => {
  res.send("User created successfully");
};

module.exports = { login, createUser, getUser, updateUser };
