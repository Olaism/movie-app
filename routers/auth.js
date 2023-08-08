const _ = require("lodash");
const bcrypt = require("bcrypt");
const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");

const router = Router();

router.post("/login", [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email")
    .escape(),
  body("password").notEmpty().withMessage("password is required"),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).send(errors.array()[0].msg);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Invalid email or password");

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(400).send("Invalid username or password");

    const token = user.genAuthToken();

    res.send(token);
  },
]);

router.post("/register", [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 5, max: 255 })
    .withMessage("username must be between 5 and 255 characters")
    .escape(),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email")
    .escape(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least eight characters long")
    .isStrongPassword()
    .withMessage("Strong password is required"),
  body("isAdmin").optional().trim().isBoolean(),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).send(errors.array()[0].msg);
    const { username, email, password, isAdmin } = req.body;
    let users = await User.find().or([{ username }, { email }]);
    if (users.length > 0)
      return res
        .status(400)
        .send("A user with the username or email already exists");
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      email,
      isAdmin: isAdmin && false,
    });
    await user.save();
    const token = user.genAuthToken();
    res
      .status(201)
      .send({ ..._.pick(user, ["username", "email", "isAdmin"]), token });
  },
]);

module.exports = router;
