require("dotenv").config();

const { JWT_SECRET = "p4ssw0rd", PORT = 3001, MONGO_URI } = process.env;

module.exports = {
  JWT_SECRET,
  PORT,
  MONGO_URI,
};
