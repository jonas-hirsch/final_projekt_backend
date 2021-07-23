const { Pool } = require("pg");
const pool = new Pool();
const { validationResult } = require("express-validator");
const path = require("path");

const getAllCategories = async (req, res) => {
  try {
    const queryResult = await pool.query("SELECT * FROM category");

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const queryResult = await pool.query("SELECT * FROM category WHERE id=$1", [
      id,
    ]);

    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(`The category with the ID ${id} does not exist in the database.`);
    }

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const createNewCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;
  try {
    const queryResult = await pool.query(
      "INSERT INTO category(name) VALUES ($1) RETURNING *",
      [name]
    );

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name } = req.body;
  try {
    const queryResult = await pool.query(
      "UPDATE category SET name=$2 WHERE id=$1 RETURNING *",
      [id, name]
    );

    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(`The category with the ID ${id} does not exist in the database.`);
    }

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteQuery = {
      text: `DELETE FROM category WHERE id=$1 RETURNING *`,
      values: [id],
    };
    const queryResult = await pool.query(deleteQuery);
    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(
          `The category with the ID ${id} does not exist in the database. Delete failed.`
        );
    }
    res.send(`Successfully delete the category with the ID ${id}.`);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createNewCategory,
  updateCategory,
  deleteCategory,
};
