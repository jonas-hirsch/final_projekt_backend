const { Pool } = require("pg");
const pool = new Pool();
const { validationResult } = require("express-validator");

const getAllAddresses = async (req, res) => {
  try {
    const queryResult = await pool.query(`SELECT * FROM address`);

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getAddressById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = {
      text: `SELECT * FROM address WHERE id=$1`,
      values: [id],
    };
    const queryResult = await pool.query(query);

    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(`The address with the ID ${id} does not exist in the database.`);
    }

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getAddressesByPerson = async (req, res) => {
  const { personId } = req.params;
  try {
    const query = {
      text: `SELECT * FROM address WHERE person=$1`,
      values: [personId],
    };
    const queryResult = await pool.query(query);

    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(
          `The person with the ID ${personId} has no stored address in the database.`
        );
    }

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const createNewAddress = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { person, street, houseNumber, city, postcode, country, primary } =
    req.body;
  try {
    if (primary) {
      const removePrimaryQuery = {
        text: `UPDATE address SET isPrimary=null WHERE person=$1`,
        values: [person],
      };
      await pool.query(removePrimaryQuery);
    }

    const query = {
      text: `INSERT INTO address(person,street,houseNumber,city,postcode,country,isPrimary) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      values: [
        person,
        street,
        houseNumber,
        city,
        postcode,
        country,
        primary === false ? null : true,
      ],
    };
    const queryResult = await pool.query(query);

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const updateAddress = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { street, houseNumber, city, postcode, country, primary } = req.body;

  try {
    const query = {
      text: `UPDATE address SET street=$1,houseNumber=$2,city=$3,postcode=$4,country=$5,isPrimary=$6 WHERE id=$7 RETURNING *`,
      values: [
        street,
        houseNumber,
        city,
        postcode,
        country,
        primary === false ? null : true,
        id,
      ],
    };
    const queryResult = await pool.query(query);

    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(`The address with the ID ${id} does not exist in the database.`);
    }

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const setAddressToPrimary = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  try {
    const getPersonQuery = {
      text: `SELECT person FROM address WHERE id=$1`,
      values: [id],
    };
    const getPersonQueryResult = await pool.query(getPersonQuery);

    if (getPersonQueryResult.rowCount === 0) {
      return res
        .status(404)
        .send(
          `The person for the address with the ID ${id} does not exist in the database.`
        );
    }

    const removePrimaryQuery = {
      text: `UPDATE address SET isPrimary=null WHERE person=$1`,
      values: [getPersonQueryResult.rows[0].person],
    };
    await pool.query(removePrimaryQuery);

    const updateQuery = {
      text: `UPDATE address SET isPrimary=true WHERE id=$1 RETURNING *`,
      values: [id],
    };
    await pool.query(updateQuery);

    const personQuery = {
      text: `SELECT * FROM address WHERE person=$1`,
      values: [getPersonQueryResult.rows[0].person],
    };
    const queryResult = await pool.query(personQuery);

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const deleteAddress = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteQuery = {
      text: `DELETE FROM address WHERE id=$1 RETURNING *`,
      values: [id],
    };
    const queryResult = await pool.query(deleteQuery);
    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(
          `The address with the ID ${id} does not exist in the database. Delete failed.`
        );
    }

    res.send(`Successfully deleted the address item with the ID ${id}.`);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

module.exports = {
  getAllAddresses,
  getAddressById,
  getAddressesByPerson,
  createNewAddress,
  updateAddress,
  setAddressToPrimary,
  deleteAddress,
};
