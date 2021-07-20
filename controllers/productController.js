const { Pool } = require("pg");
const pool = new Pool();

const getAllProducts = async (req, res, next) => {
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

module.exports = {
  getAllProducts,
};
