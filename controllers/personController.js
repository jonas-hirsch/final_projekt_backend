const { Pool } = require("pg");
const pool = new Pool();
const { validationResult, query } = require("express-validator");

const getAllPersons = async (req, res) => {
  try {
    const queryResult = await pool.query("SELECT * FROM person");

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getSinglePerson = async (req, res) => {
  const { id } = req.params;

  try {
    const queryResult = await pool.query("SELECT * FROM person WHERE id=$1", [
      id,
    ]);

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const createNewPerson = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, title, firstName, lastName } = req.body;
  try {
    const updateQuery = {
      text: `INSERT INTO person(email,password,title,firstName,lastName,userlevel) VALUES($1,$2,$3,$4,$5,0) RETURNING *`,
      values: [email, password, title, firstName, lastName],
    };
    const queryResult = await pool.query(updateQuery);

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};
const updatePerson = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, title, firstName, lastName } = req.body;
  try {
    const updateQuery = {
      text: `UPDATE person SET email=$1,password=$2,title=$3,firstName=$4,lastName=$5 RETURNING *`,
      values: [email, password, title, firstName, lastName],
    };
    const queryResult = await pool.query(updateQuery);

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const deletePerson = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteQuery = {
      text: `DELETE FROM person WHERE id=$1 RETURNING *`,
      values: [id],
    };
    const queryResult = await pool.query(deleteQuery);
    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(
          `The person with the ID ${id} does not exist in the database. Delete failed.`
        );
    }

    res.send(`Successfully delete the person with the ID ${id}.`);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const setRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const query = {
      text: `UPDATE person SET role=$2 WHERE id=$1 RETURNING *`,
      values: [id, role],
    };
    const queryResult = await pool.query(query);
    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(
          `The person with the ID ${id} does not exist in the database. Set user level failed.`
        );
    }

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

module.exports = {
  getAllPersons,
  getSinglePerson,
  createNewPerson,
  updatePerson,
  deletePerson,
  setRole,
};
