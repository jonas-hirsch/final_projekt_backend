const User = require("../utils/user");
const personController = require("./personController");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  const { email, password } = req.body;

  const person = await personController.getSinglePersonByEmail(req);
  if (!person) return res.status(400).send("Invalid Request");

  console.log(password);
  console.log(person.password);
  const match = await bcrypt.compare(password, person.password);
  if (!match) return res.status(400).send("Invalid credentials");

  const token = User.createToken(email.trim().toLowerCase());
  res.set("x-authorization-token", token).send("Login successful");
};

const register = async (req, res) => {
  const { email, password } = req.body;
  req.body.password = await bcrypt.hash(password, 10);
  try {
    const createUserResult = await personController.createNewPerson(req);
    console.log(createUserResult);

    const token = User.createToken(email);
    return res.set("x-authorization-token", token).send(createUserResult);
  } catch (error) {
    console.error(error);
    if ((error.constraint = "unique_email")) {
      return res
        .status(409)
        .send(`The e-mail address ${email} is already registered.`);
    }
    return res.status(500).send(error.constraint);
  }

  const token = User.createToken(email.trim().toLowerCase());
  res.set("x-authorization-token", token).send("Login successful");
};

const getUserInformation = async (req, res) => {
  try {
    const { id, email, firstname, lastname, role } = await User.destructToken(
      req.headers.authorization
    );
    return res.send({ id, email, firstname, lastname, role });
  } catch (error) {
    res.status(403).send(error.message);
  }
  res.send(req.headers.authorization);
};

module.exports = { login, register, getUserInformation };
