const { Pool } = require("pg");
const pool = new Pool();
const { validationResult } = require("express-validator");

const getAllProducts = async (req, res) => {
  try {
    const { rows: productRows } = await pool.query(`
      SELECT *
      FROM   product p
      CROSS  JOIN LATERAL (
        SELECT json_agg(m) AS media
        FROM   media m
        WHERE  m.product = p.id
        ) c1
      CROSS  JOIN LATERAL (
        SELECT json_agg(s) AS stock
        FROM   stock s
        WHERE  s.product = p.id
        ) id
    `);

    res.send(productRows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};
const getSingleProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: productRows } = await pool.query(
      `
      SELECT *
      FROM   product p
      CROSS  JOIN LATERAL (
        SELECT json_agg(m) AS media
        FROM   media m
        WHERE  m.product = p.id
        ) c1
      CROSS  JOIN LATERAL (
        SELECT json_agg(s) AS stock
        FROM   stock s
        WHERE  s.product = p.id
        ) id
      WHERE p.id=$1
    `,
      [id]
    );

    if (productRows.length < 1) {
      return res
        .status(404)
        .send(`Could not find the product with the id ${id}.`);
    }

    res.send(productRows[0]);
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
      return res
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
  getSingleProduct,
  createNewProduct,
  updateProduct,
  deleteProduct,
};
