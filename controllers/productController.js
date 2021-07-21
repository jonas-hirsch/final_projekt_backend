const { Pool } = require("pg");
const pool = new Pool();
const { validationResult } = require("express-validator");

const getAllProducts = async (req, res) => {
  try {
    const queryResult = await pool.query("SELECT * from product");

    if (queryResult.rowCount < 1) {
      return res.status(404).send("Could not find any products.");
    }

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};
const createNewProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description } = req.body;
  try {
    const insertQuery = {
      text: `INSERT INTO product (title, description) VALUES ($1, $2) RETURNING *`,
      values: [title, description],
    };
    const queryResult = await pool.query(insertQuery);

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { title, description } = req.body;
  try {
    const updateQuery = {
      text: `UPDATE product SET title=$1, description=$2 WHERE ID=$3 RETURNING *`,
      values: [title, description, id],
    };
    const queryResult = await pool.query(updateQuery);

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteQuery = {
      text: `DELETE FROM product WHERE id=$1 RETURNING *`,
      values: [id],
    };
    const queryResult = await pool.query(deleteQuery);
    if (queryResult.rowCount === 0) {
      res
        .status(404)
        .send(
          `The product with the ID ${id} does not exist in the database. Delete failed.`
        );
    }

    res.send(`Successfully delete the product with the ID ${id}.`);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

module.exports = {
  getAllProducts,
  createNewProduct,
  updateProduct,
  deleteProduct,
};
