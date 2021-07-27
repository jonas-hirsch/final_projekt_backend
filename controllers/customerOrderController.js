const { Pool } = require("pg");
const pool = new Pool();
const { validationResult } = require("express-validator");
var format = require("pg-format");

const getAllCustomerOrders = async (req, res) => {
  try {
    const queryResult = await pool.query("SELECT * FROM customerOrder");

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getOrderByOrderId = async (req, res) => {
  const { id } = req.params;
  try {
    const queryResult = await pool.query(
      "SELECT * FROM customerOrder WHERE id=$1",
      [id]
    );

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getCustomerOrdersByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const queryResult = await pool.query(
      "SELECT * FROM customerOrder WHERE person=$1",
      [userId]
    );

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const createCustomerOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { person, orderTime, shippingTime, trackingNumber } = req.body;
  try {
    const query = {
      text: `INSERT INTO customerOrder (person,orderTime,shippingTime,trackingNumber) 
      VALUES($1,$2,$3,$4) 
      RETURNING *`,
      values: [person, orderTime, shippingTime, trackingNumber],
    };
    const queryResult = await pool.query(query);

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const updateCustomerOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { person, orderTime, shippingTime, trackingNumber } = req.body;
  try {
    const query = {
      text: `UPDATE customerOrder SET person=$1,orderTime=$2,shippingTime=$3,trackingNumber=$4 WHERE id=$5 RETURNING *`,
      values: [person, orderTime, shippingTime, trackingNumber, id],
    };
    const queryResult = await pool.query(query);

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const setShippingInformation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { shippingTime, trackingNumber } = req.body;
  try {
    const query = {
      text: `UPDATE customerOrder SET shippingTime=$1,trackingNumber=$2 WHERE id=$3 RETURNING *`,
      values: [shippingTime, trackingNumber, id],
    };
    const queryResult = await pool.query(query);

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const setOrderShippingTime = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { shippingTime } = req.body;
  try {
    const query = {
      text: `UPDATE customerOrder SET shippingTime=$1 WHERE id=$2 RETURNING *`,
      values: [shippingTime, id],
    };
    const queryResult = await pool.query(query);

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const setTrackingNumber = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { trackingNumber } = req.body;
  try {
    const query = {
      text: `UPDATE customerOrder SET trackingNumber=$1 WHERE id=$2 RETURNING *`,
      values: [trackingNumber, id],
    };
    const queryResult = await pool.query(query);

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const deleteCustomerOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteQuery = {
      text: `DELETE FROM customerOrder WHERE id=$1 RETURNING *`,
      values: [id],
    };
    const queryResult = await pool.query(deleteQuery);
    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(
          `The customer order with the ID ${id} does not exist in the database. Delete failed.`
        );
    }

    res.send(`Successfully delete the customer order with the ID ${id}.`);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

module.exports = {
  getAllCustomerOrders,
  getOrderByOrderId,
  getCustomerOrdersByUser,
  createCustomerOrder,
  updateCustomerOrder,
  setShippingInformation,
  setOrderShippingTime,
  setTrackingNumber,
  deleteCustomerOrder,
};
