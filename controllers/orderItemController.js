const { Pool } = require("pg");
const pool = new Pool();
const { validationResult } = require("express-validator");
const format = require("pg-format");

const getAllOrderItems = async (req, res) => {
  try {
    const queryResult = await pool.query(`SELECT * FROM orderItem`);

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getOrderItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = {
      text: `SELECT * FROM orderItem WHERE id=$1`,
      values: [id],
    };
    const queryResult = await pool.query(query);

    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(
          `The order item with the ID ${id} does not exist in the database.`
        );
    }

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getOrderItemByOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const query = {
      text: `SELECT * FROM orderItem WHERE customerOrder=$1`,
      values: [orderId],
    };
    const queryResult = await pool.query(query);

    if (queryResult.rowCount === 0) {
      if (res) {
        return res
          .status(404)
          .send(
            `The order with the ID ${orderId} does not exist in the database.`
          );
      }
      return [];
    }

    if (res) {
      return res.send(queryResult.rows);
    }
    return queryResult.rows;
  } catch (error) {
    console.error(error);
    if (res) {
      return res.status(500).send(error.message);
    }
    throw error;
  }
};

const createNewOrderItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { product, order, amount, color, size, price } = req.body;
  try {
    const query = {
      text: `INSERT INTO orderItem(product,customerOrder,amount,color,size,price) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      values: [product, order, amount, color, size, price],
    };
    const queryResult = await pool.query(query);

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const createManyNewOrderItems = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let dataArray = [];
  req.body.forEach((element) => {
    const { product, amount, size, color, customerOrder, stock } = element;
    const { price } = stock[0];
    dataArray = [
      ...dataArray,
      [product, amount, size, color, customerOrder, price],
    ];
  });
  try {
    const queryResult = await pool.query(
      format(
        "INSERT INTO orderItem(product,amount,size,color,customerOrder,price) VALUES %L RETURNING *",
        dataArray
      )
    );
    if (res) {
      return res.send(queryResult.rows);
    } else {
      return queryResult.rows;
    }
  } catch (error) {
    console.error(error);
    if (res) {
      return res.status(500).send(error.message);
    }
    throw error;
  }
};

const updateOrderItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { product, order, amount, color, size, price } = req.body;
  try {
    const query = {
      text: `UPDATE orderItem SET product=$1,customerOrder=$2,amount=$3,color=$4,size=$5,price=$6 WHERE id=$7 RETURNING *`,
      values: [product, order, amount, color, size, price, id],
    };
    const queryResult = await pool.query(query);

    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(
          `The order item with the ID ${id} does not exist in the database.`
        );
    }

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const deleteOrderItem = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteQuery = {
      text: `DELETE FROM orderItem WHERE id=$1 RETURNING *`,
      values: [id],
    };
    const queryResult = await pool.query(deleteQuery);
    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(
          `The order item with the ID ${id} does not exist in the database. Delete failed.`
        );
    }

    res.send(`Successfully deleted the order item with the ID ${id}.`);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

module.exports = {
  getAllOrderItems,
  getOrderItemById,
  getOrderItemByOrder,
  createNewOrderItem,
  createManyNewOrderItems,
  updateOrderItem,
  deleteOrderItem,
};
