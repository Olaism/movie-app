const _ = require("lodash");
const router = require("express").Router();
const { authenticateToken } = require("../middlewares/authenticate");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");

router.put("/", [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage("username must be between 5 and 255 characters")
    .escape(),
  body("email")
    .trim()
    .optional()
    .isEmail()
    .withMessage("Email must be a valid email")
    .escape(),
  body("isAdmin")
    .optional()
    .trim()
    .isBoolean()
    .withMessage("isAdmin must be a boolean"),
  authenticateToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).send(errors.array()[0].msg);

    const { username, email, isAdmin } = req.body;
    let user = await User.find().or([{ username }, { email }]);
    console.log(user);
    if (user.length >= 1) {
      return res.status(400).send("Username or Email already exists.");
    }

    const { _id: userId } = req.user;
    user = await User.findById(userId);
    if (!user) return res.sendStatus(403);

    user.username = username || user.username;
    user.email = email || user.email;
    user.isAdmin = isAdmin || user.isAdmin;
    await user.save();
    res.status(201).send(_.pick(user, ["username", "email", "isAdmin"]));
  },
]);

router.delete("/", authenticateToken, async (req, res) => {
  const { _id } = req.user;
  const user = await User.findByIdAndRemove(_id);
  if (!user) return res.sendStatus(404);
  return res.sendStatus(204);
});

module.exports = router;
