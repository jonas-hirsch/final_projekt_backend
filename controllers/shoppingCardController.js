const { Pool } = require("pg");
const pool = new Pool();
const { validationResult } = require("express-validator");
var format = require("pg-format");

const getAllShoppingCardItems = async (req, res) => {
  try {
    const queryResult = await pool.query("SELECT * FROM shoppingCard");

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getShoppingCarItemsByUserId = async (req, res) => {
  const { id } = req.params;
  try {
    const queryResult = await pool.query(
      "SELECT * FROM shoppingCard WHERE person=$1",
      [id]
    );

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getShoppingCarItemsWithStockByUserId = async (req, res) => {
  const { id } = req.params;
  try {
    const queryResult = await pool.query(
      `SELECT shoppingCard.*, price
      FROM shoppingCard
      INNER JOIN stock
      ON stock.id = shoppingCard.stock
      WHERE person=$1`,
      [id]
    );

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const createNewShoppingCardItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { product, amount, size, color, person, stock } = req.body;
  try {
    const query = {
      text: `INSERT INTO shoppingCard (product,amount,size,color,person,stock) 
      VALUES($1,$2,$3,$4,$5,$6) 
      RETURNING *`,
      values: [product, amount, size, color, person, stock],
    };
    const queryResult = await pool.query(query);

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const createManyNewShoppingCardItems = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let dataArray = [];
  req.body.forEach((element) => {
    let { product, amount, size, color, person, stock } = element;
    dataArray = [...dataArray, [product, amount, size, color, person, stock]];
  });
  try {
    const queryResult = await pool.query(
      format(
        "INSERT INTO shoppingCard (product,amount,size,color,person,stock) VALUES %L RETURNING *",
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

const createNewShoppingCardItemByStockId = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { stockId } = req.params;
  const { amount, user } = req.body;

  try {
    const stockQueryResult = await pool.query(
      "SELECT * FROM stock WHERE id=$1",
      [stockId]
    );
    const stockProduct = stockQueryResult.rows[0];
    const insertUpdateResult = await pool.query(
      `
      INSERT INTO shoppingCard(product,amount,person,size,color,stockId) 
        VALUES($1,$2,$3,$4,$5,$6)
      ON CONFLICT ON CONSTRAINT product_once 
      DO 
        UPDATE SET amount=(
          SELECT amount 
          FROM shoppingCard 
          WHERE product=$1 AND person=$3 AND size=$4 AND color=$5 ) + $2 
          RETURNING *
      `,
      [
        stockProduct.product,
        amount,
        user,
        stockProduct.size,
        stockProduct.color,
        stockId,
      ]
    );

    res.send(insertUpdateResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.send(error.message);
  }
};

const createManyNewShoppingCardItemsByStockId = async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({ errors: errors.array() });
  // }
  const { userId } = req.params;

  let dataArray = [];
  let idArray = [];
  req.body.forEach((element) => {
    let { stockId, amount } = element;
    dataArray = [...dataArray, [stockId, amount]];
  });
  req.body.forEach((element) => {
    let { stockId } = element;
    idArray.push(stockId);
  });
  console.log(dataArray);
  try {
    const stockQueryResult = await pool.query(
      format("SELECT * FROM stock WHERE id IN(%L)", idArray)
    );
    if (stockQueryResult.rows.some((row) => row.quantity === 0)) {
      return res.status(404).send("Not enough stock available");
    }
    if (stockQueryResult.rowCount != dataArray.length) {
      return res.status(404).send("Not all stock items are available.");
    }
    const inputBodyCopy = [...req.body];
    req.body = [];
    inputBodyCopy.forEach((cartEntry) => {
      const stockProduct = stockQueryResult.rows.find(
        (stock) => stock.id === cartEntry.stockId
      );
      req.body.push({
        product: stockProduct.product,
        person: parseInt(userId),
        amount: cartEntry.amount,
        size: stockProduct.size,
        color: stockProduct.color,
      });
    });
    const insertResult = await createManyNewShoppingCardItems(req);

    return res.send(insertResult);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
};

const updateShoppingCardItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { amount, size, color, stockId } = req.body;
  try {
    const query = {
      text: `UPDATE shoppingCard SET amount=$1, color=$2, size=$3, stockId=$4 WHERE id=$4 RETURNING *`,
      values: [amount, color, size, id, stockId],
    };
    const queryResult = await pool.query(query);

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};
const deleteSingleShoppingCardItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteQuery = {
      text: `DELETE FROM shoppingCard WHERE id=$1 RETURNING *`,
      values: [id],
    };
    const queryResult = await pool.query(deleteQuery);
    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(
          `The shopping card item with the ID ${id} does not exist in the database. Delete failed.`
        );
    }

    res.send(`Successfully delete the shopping card item with the ID ${id}.`);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};
const deleteShoppingCardItemsByUserId = async (
  req,
  res,
  dontDeleteZeroProducts
) => {
  const { userId } = req.params;
  try {
    let deleteQuery = {
      text: `DELETE FROM shoppingCard WHERE person=$1 RETURNING *`,
      values: [userId],
    };
    if (dontDeleteZeroProducts) {
      deleteQuery = {
        text: `DELETE FROM shoppingCard WHERE person=$1 AND amount != 0 RETURNING *`,
        values: [userId],
      };
    }

    const queryResult = await pool.query(deleteQuery);
    if (queryResult.rowCount === 0) {
      if (res) {
        return res
          .status(404)
          .send(
            `The user with the ID ${userId} has no products in its shopping card. Delete failed.`
          );
      }
      return queryResult;
    }

    if (res) {
      return res.send(
        `Successfully deleted ${queryResult.rowCount} shopping cards items of the user with the ID ${userId}.`
      );
    }
    return queryResult;
  } catch (error) {
    console.error(error);
    if (res) {
      return res.status(500).send(error.message);
    }
  }
};

module.exports = {
  getAllShoppingCardItems,
  getShoppingCarItemsByUserId,
  getShoppingCarItemsWithStockByUserId,
  createNewShoppingCardItem,
  createNewShoppingCardItemByStockId,
  createManyNewShoppingCardItems,
  createManyNewShoppingCardItemsByStockId,
  updateShoppingCardItem,
  deleteSingleShoppingCardItemById,
  deleteShoppingCardItemsByUserId,
};
