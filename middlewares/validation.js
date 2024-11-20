const { Joi, celebrate, Segments } = require("celebrate");
const validator = require("validator");

const avatarOptions = [
  "/assets/avatar1.png",
  "/assets/avatar2.png",
  "/assets/avatar3.png",
  "/assets/avatar4.png",
  "/assets/avatar5.png",
];

const validateURL = (value, helpers) => {
  if (!validator.isURL(value)) {
    return helpers.error("string.uri");
  }
  return value;
};

const validateEmail = (value, helpers) => {
  if (!validator.isEmail(value)) {
    return helpers.error("string.email");
  }
  return value;
};

const validateCreateUser = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30).required(),
    avatar: Joi.string()
      .valid(...avatarOptions)
      .required(),
  }),
});

const validateUserLogin = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().required().custom(validateEmail).messages({
      "string.email": 'The "email" field must be a valid email address',
      "string.empty": 'The "email" field must be filled in',
    }),
    password: Joi.string().required().messages({
      "string.empty": 'The "password" field must be filled in',
    }),
  }),
});

const validateUpdateUserProfile = celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 30',
    }),
    avatar: Joi.string()
      .valid(...avatarOptions)
      .messages({
        "any.only": 'The "avatar" field must be one of the allowed values',
      }),
  }),
});

const validateCreatePokemon = celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(30).required().messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 30',
      "string.empty": 'The "name" field must be filled in',
    }),
    type: Joi.string().required().messages({
      "string.empty": 'The "type" field must be filled in',
    }),
    imageUrl: Joi.string().custom(validateURL).messages({
      "string.uri": 'The "imageUrl" field must be a valid URL',
      "string.empty": 'The "imageUrl" field must be filled in',
    }),
  }),
});

const validateId = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().hex().length(24).required().messages({
      "string.hex": 'The "id" parameter must be a valid hexadecimal value',
      "string.length": 'The "id" parameter must be 24 characters long',
      "string.empty": 'The "id" parameter must be filled in',
    }),
  }),
});

module.exports = {
  validateCreateUser,
  validateUserLogin,
  validateUpdateUserProfile,
  validateCreatePokemon,
  validateId,
};
