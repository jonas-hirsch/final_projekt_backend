const { Pool } = require("pg");
const pool = new Pool();

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

    if (queryResult.rows.length === 0) {
      if (res) {
        return res
          .status(404)
          .send(`Could not find the order with the id ${id}`);
      }
      throw Error("Could not find the order with the id ${id}");
    }

    if (res) {
      return res.send(queryResult.rows[0]);
    }
    return queryResult.rows[0];
  } catch (error) {
    console.error(error);
    if (res) {
      return res.status(500).send(error.message);
    }
    throw error;
  }
};

const getCustomerOrdersByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const queryResult = await pool.query(
      "SELECT * FROM customerOrder WHERE person=$1",
      [userId]
    );

    if (queryResult.rows.length === 0) {
      return res
        .status(404)
        .send(
          `Could not find any orders for the customer with the id ${userId}`
        );
    }

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const createCustomerOrder = async (req, res) => {
  const { person, orderTime, shippingTime, trackingNumber } = req.body;
  try {
    const query = {
      text: `INSERT INTO customerOrder (person,orderTime,shippingTime,trackingNumber) 
      VALUES($1,$2,$3,$4) 
      RETURNING *`,
      values: [person, orderTime, shippingTime, trackingNumber],
    };
    const queryResult = await pool.query(query);

    if (res) {
      return res.send(queryResult.rows[0]);
    } else {
      return queryResult.rows[0];
    }
  } catch (error) {
    console.error(error);
    if (res) {
      return res.status(500).send(error.message);
    }
    throw error;
  }
};

const updateCustomerOrder = async (req, res) => {
  const { id } = req.params;
  const { person, orderTime, shippingTime, trackingNumber } = req.body;
  try {
    const query = {
      text: `UPDATE customerOrder SET person=$1,orderTime=$2,shippingTime=$3,trackingNumber=$4 WHERE id=$5 RETURNING *`,
      values: [person, orderTime, shippingTime, trackingNumber, id],
    };
    const queryResult = await pool.query(query);

    if (queryResult.rows.length === 0) {
      return res.status(404).send(`Could not find a order with the id ${id}`);
    }

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const setShippingInformation = async (req, res) => {
  const { id } = req.params;
  const { shippingTime, trackingNumber } = req.body;
  try {
    const query = {
      text: `UPDATE customerOrder SET shippingTime=$1,trackingNumber=$2 WHERE id=$3 RETURNING *`,
      values: [shippingTime, trackingNumber, id],
    };
    const queryResult = await pool.query(query);

    if (queryResult.rows.length === 0) {
      return res.status(404).send(`Could not find a order with the id ${id}`);
    }

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const setOrderShippingTime = async (req, res) => {
  const { id } = req.params;
  const { shippingTime } = req.body;
  try {
    const query = {
      text: `UPDATE customerOrder SET shippingTime=$1 WHERE id=$2 RETURNING *`,
      values: [shippingTime, id],
    };
    const queryResult = await pool.query(query);

    if (queryResult.rows.length === 0) {
      return res.status(404).send(`Could not find a order with the id ${id}`);
    }

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const setTrackingNumber = async (req, res) => {
  const { id } = req.params;
  const { trackingNumber } = req.body;
  try {
    const query = {
      text: `UPDATE customerOrder SET trackingNumber=$1 WHERE id=$2 RETURNING *`,
      values: [trackingNumber, id],
    };
    const queryResult = await pool.query(query);

    if (queryResult.rows.length === 0) {
      return res.status(404).send(`Could not find a order with the id ${id}`);
    }

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
