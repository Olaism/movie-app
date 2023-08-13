const _ = require("lodash");
const express = require("express");
const { body, validationResult } = require("express-validator");
const Customer = require("../models/customer");
const { Rental } = require("../models/rental");
const { validateId } = require("../utils/validator");
const router = express.Router();

router.get("/", async function (req, res) {
  const customers = await Customer.find();
  res.send(customers);
});
router.get("/:id", async function (req, res) {
  const { id } = req.params;
  let customer = await Customer.findById(id);
  if (!customer) return res.sendStatus(404);
  const rentals = await Rental.find({ customer: customer._id })
    .populate({
      path: "movie",
      select: "_id title",
    })
    .select("-customer");
  customer = { ...customer._doc, rentals };
  res.send(customer);
});
router.post("/", [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 3, max: 255 })
    .withMessage("username must be at least three characters long")
    .escape(),
  body("email", "Invalid email")
    .notEmpty()
    .withMessage("Email is required")
    .isLength({ min: 5 })
    .withMessage("email must be at least five characters long")
    .trim()
    .escape()
    .isEmail()
    .withMessage("email must be a valid email address"),
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
    res.status(201).send(customer);
  },
]);
router.put("/:id", [
  body("username")
    .trim()
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage("username must be at least three characters long")
    .escape(),
  body("email", "Invalid email")
    .optional()
    .isLength({ min: 5 })
    .trim()
    .escape()
    .isEmail(),
  body("phone", "Invalid Phone Number")
    .optional()
    .trim()
    .isLength({ min: 9 })
    .withMessage("Phone must be at least 9 characters")
    .isMobilePhone(),
  body("isGold", "isGold must be true or false")
    .optional()
    .trim()
    .isBoolean()
    .withMessage("isGold can either be true or false"),
  async function (req, res) {
    const { username, email, phone, isGold } = req.body;
    // validate request and send appropiate message
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
    if (!validateId(req.params.id)) return res.sendStatus(404);
    customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: username || customer.username,
          email: email || customer.email,
          phone: phone || customer.phone,
          isGold: isGold || customer.isGold,
        },
      },
      { new: true }
    );
    if (!customer) return res.status(404).send("Not found");
    res.status(201).send(customer);
  },
]);
router.delete("/:id", async function (req, res) {
  const { id } = req.params;
  // validate id
  if (!validateId(id)) return res.sendStatus(404);
  const customer = await Customer.findByIdAndRemove(id);
  if (!customer) return res.sendStatus(404);
  res.status(204).send(customer);
});

module.exports = router;
