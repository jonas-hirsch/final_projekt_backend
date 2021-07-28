const { Pool } = require("pg");
const pool = new Pool();
const { validationResult } = require("express-validator");

const getAllStock = async (req, res) => {
  try {
    const queryResult = await pool.query("SELECT * FROM stock");

    if (queryResult.rowCount < 1) {
      return res.status(404).send("Could not get any stock items.");
    }

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getAvailableStockForProduct = async (req, res) => {
  const { productId } = req.params;
  const query = {
    text: `SELECT * FROM stock WHERE product = $1 ORDER BY price`,
    values: [productId],
  };
  try {
    const queryResult = await pool.query(query);

    if (queryResult.rowCount < 1) {
      return res
        .status(404)
        .send(
          `Could not find a stock for the the product with the id ${productId}.`
        );
    }

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getAvailableStockForProductSpecification = async (req, res) => {
  let dataArray = [];
  req.body.forEach((element) => {
    dataArray.push(element.product);
  });
  try {
    const queryResult = await pool.query(
      "SELECT * FROM stock WHERE product = ANY($1::int[])",
      [dataArray]
    );
    if (res) {
      return res.send(queryResult.rows);
    } else {
      req.body.forEach((item) => {
        const { product, size, color } = item;
        const stockItem = queryResult.rows.filter(
          (row) =>
            row.product === product &&
            row.size.toLowerCase() === size.toLowerCase() &&
            row.color.toLowerCase() === color.toLowerCase()
        );
        // console.log("stockItem: " + JSON.stringify(stockItem));
        item.stock = stockItem;
      });
    }
  } catch (error) {
    console.error(error);
    if (res) {
      return res.status(500).send(error.message);
    }
    throw error;
  }
};

const updateStockObject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const {
    price,
    discountAbsolute,
    discountRelative,
    color,
    size,
    valideFrom,
    valideTo,
    quantity,
  } = req.body;
  const query = {
    text: `UPDATE stock 
    SET 
      price=$2, 
      discountAbsolute=$3, 
      discountRelative=$4, 
      color=$5, 
      size=$6, 
      valideFrom=$7, 
      valideTo=$8,
      quantity=$9
    WHERE id=$1
    RETURNING *`,
    values: [
      id,
      price,
      discountAbsolute,
      discountRelative,
      color,
      size,
      valideFrom,
      valideTo,
      quantity,
    ],
  };
  try {
    const queryResult = await pool.query(query);

    if (queryResult.rowCount < 1) {
      return res.status(404).send(`Could not find a stock with the id ${id}.`);
    }

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const addNewStockObjectForProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { productId } = req.params;
  const {
    price,
    discountAbsolute,
    discountRelative,
    color,
    size,
    quantity,
    valideFrom,
    valideTo,
  } = req.body;
  const query = {
    text: `INSERT INTO stock (product, price, discountAbsolute, discountRelative, quantity, color, size, valideFrom, valideTo) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
    values: [
      productId,
      price,
      discountAbsolute,
      discountRelative,
      quantity,
      color,
      size,
      valideFrom,
      valideTo,
    ],
  };
  try {
    const queryResult = await pool.query(query);

    if (queryResult.rowCount < 1) {
      return res
        .status(404)
        .send(
          `Could not create a new stock entry for the product with the id ${productId}.`
        );
    }

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const setStockQuantityAbsolute = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  console.log("ID: " + id);
  const { quantity } = req.body;
  try {
    const updateQuery = {
      text: `UPDATE stock SET quantity=$2 WHERE id=$1 RETURNING *`,
      values: [id, quantity],
    };
    const queryResult = await pool.query(updateQuery);
    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(
          `The stock media with the ID ${id} does not exist in the database. Update failed.`
        );
    }

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const changeStockQuantityRelative = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  try {
    const updateQuery = {
      text: `UPDATE stock SET quantity = quantity + $2 WHERE id=$1 RETURNING *`,
      values: [id, quantity],
    };
    const queryResult = await pool.query(updateQuery);
    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(
          `The stock media with the ID ${id} does not exist in the database. Update failed.`
        );
    }

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const deleteStock = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteQuery = {
      text: `DELETE FROM stock WHERE id=$1 RETURNING *`,
      values: [id],
    };
    const queryResult = await pool.query(deleteQuery);
    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(
          `The stock media with the ID ${id} does not exist in the database. Delete failed.`
        );
    }

    res.send(`Successfully delete the stock media with the ID ${id}.`);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

module.exports = {
  getAllStock,
  getAvailableStockForProduct,
  getAvailableStockForProductSpecification,
  updateStockObject,
  addNewStockObjectForProduct,
  setStockQuantityAbsolute,
  changeStockQuantityRelative,
  deleteStock,
};
