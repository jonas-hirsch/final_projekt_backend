const { Pool } = require("pg");
const pool = new Pool();
const { validationResult } = require("express-validator");
const customerOrderController = require("./customerOrderController");
const orderItemController = require("./orderItemController");
const shoppingCardController = require("./shoppingCardController");
const productStockController = require("./productStockController");

const checkout = async (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  try {
    // Get all shopping card items for the given user
    const shoppingCardQueryResult = await pool.query(
      `SELECT * FROM shoppingCard WHERE person=$1`,
      [userId]
    );
    if (shoppingCardQueryResult.rowCount === 0) {
      return res
        .status(400)
        .send(
          "The shopping card does not contain and articles. Checkout failed"
        );
    }

    // Create a new customer order
    const createOrderResult = await createNewCustomerOrder(req, userId);
    if (!createOrderResult) {
      console.error("Error: Failed to create a new order for: " + req.body);
      return res.status(500).send("Error: Failed to create a new order");
    }

    req.body = shoppingCardQueryResult.rows.filter((item) => item.amount != 0);
    await productStockController.getAvailableStockForProductSpecification(req);

    // Insert all items from the shopping card that have an amout of more than 0 into the order items table
    // If the INSERT failed -> Delete customer order
    const insertResult = await insertItemsInOrderItemsTable(
      req,
      createOrderResult
    );
    if (insertResult !== true) return insertResult;

    // Delete all items from the shopping card that got added to the order items table.
    const deleteResult = await deleteShoppingCardItems(req);
    if (deleteResult !== true) return deleteResult;

    res.send("Order performed");
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};
const createNewCustomerOrder = async (req, userId) => {
  req.body = { person: userId, orderTime: new Date().toISOString() };
  const createOrderResult = await customerOrderController.createCustomerOrder(
    req
  );
  return createOrderResult;
};
const insertItemsInOrderItemsTable = async (req, createOrderResult) => {
  req.body.forEach(async (item) => (item.customerOrder = createOrderResult.id));
  const createOrderItemsResult =
    await orderItemController.createManyNewOrderItems(req);

  if (createOrderItemsResult.rowCount === 0) {
    await pool.query(`DELETE FROM customerOrder WHERE id=$1`, [
      createOrderResult.id,
    ]);
    return res.status(500).send("Failed to create the shopping card items.");
  }
  return true;
};
const deleteShoppingCardItems = async (req) => {
  const deleteShoppingCardItemsResult =
    await shoppingCardController.deleteShoppingCardItemsByUserId(
      req,
      null,
      true
    );
  if (deleteShoppingCardItemsResult.rowCount === 0) {
    return res
      .status(500)
      .send("Failed to delete the bought shopping card items.");
  }
  return true;
};

const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    // Set the order to be not active
    const updateOrderResult = await pool.query(
      `UPDATE customerOrder SET active=false WHERE id=$1 RETURNING *`,
      [orderId]
    );
    if (updateOrderResult.rowCount != 1) {
      return res
        .status(404)
        .send(`Could not find the order with the id ${orderId}`);
    }

    // Insert shopping items back into the shopping card.
    req.body = await orderItemController.getOrderItemByOrder(req);
    req.body.forEach(
      (item) => (item.person = updateOrderResult.rows[0].person)
    );
    const insertShoppingCardResult =
      await shoppingCardController.createManyNewShoppingCardItems(req);
    if (insertShoppingCardResult.rowCount === 0) {
      return res
        .status(500)
        .send(
          "Failed to copy the items from the orders table into the shopping card"
        );
    }

    res.send("Order canceled");
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

module.exports = {
  checkout,
  cancelOrder,
};
