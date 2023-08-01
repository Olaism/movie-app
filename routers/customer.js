const express = require("express");
const { body, validationResult } = require("express-validator");
const Customer = require("../models/customer");
const { validateId } = require("../validator");
const router = express.Router();

router.get("/", async function (req, res) {
  const customers = await Customer.find();
  res.send(customers);
});
router.get("/:id", async function (req, res) {
  const { id } = req.params;
  const customer = await Customer.findById(id);
  if (!customer) return res.status(404).send("Not Found");
  res.send(customer);
});
router.post("/", [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username must not be empty")
    .isLength({ min: 3 })
    .escape()
    .withMessage("username must be at least three length long"),
  body("email", "Invalid email")
    .notEmpty()
    .isLength({ min: 5 })
    .trim()
    .escape()
    .isEmail(),
  body("phone", "Invalid Phone Number").optional().trim().isMobilePhone(),
  body("isGold", "isGold must be true or false").optional().trim().isBoolean(),
  async function (req, res) {
    const { username, email, phone, isGold } = req.body;
    // validate request ans send appropiate message
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).send(errors.array()[0].msg);
    // check if customer with username already exists
    let customer = await Customer.find().or([
      { username: username },
      { email: email },
    ]);
    if (customer.length !== 0)
      return res.status(400).send("username or email already exists!");
    customer = new Customer({
      username: username,
      email: email,
      phone: phone,
      isGold: isGold,
    });
    await customer.save();
    res.send(customer);
  },
]);
router.put("/:id", [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username must not be empty")
    .isLength({ min: 3 })
    .escape()
    .withMessage("username must be at least three length long"),
  body("email", "Invalid email")
    .notEmpty()
    .isLength({ min: 5 })
    .trim()
    .escape()
    .isEmail(),
  body("phone", "Invalid Phone Number")
    .optional()
    .trim()
    .isLength({ min: 9 })
    .isMobilePhone(),
  body("isGold", "isGold must be true or false").optional().trim().isBoolean(),
  async function (req, res) {
    const { username, email, phone, isGold } = req.body;
    // validate request ans send appropiate message
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).send(errors.array()[0].msg);
    // check if customer with username already exists
    let customer = await Customer.find().or([
      { username: username },
      { email: email },
    ]);
    if (customer.length !== 0)
      return res.status(400).send("username or email already exists!");
    // validate id
    if (!validateId(req.params.id)) return res.status(404).send("Not found");
    customer = await Customer.findByIdAndUpdate(req.params.id, {
      $set: {
        username: username,
        email: email,
        phone: phone,
        isGold: isGold,
      },
    });
    if (!customer) return res.status(404).send("Not found");
    res.send(customer);
  },
]);
router.delete("/:id", async function (req, res) {
  const { id } = req.params;
  // validate id
  if (!validateId(id)) return res.status(404).send("Not found");
  const customer = await Customer.findByIdAndRemove(id);
  if (!customer) return res.send(404).send("Not Found");
  res.send(customer);
});

module.exports = router;
