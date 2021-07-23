const { Pool } = require("pg");
const pool = new Pool();
const { validationResult } = require("express-validator");

const getProductQuery = `
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
      CROSS  JOIN LATERAL (
        SELECT json_agg(c) AS category
        FROM   productCategory pc
        INNER JOIN category c ON c.id = pc.category
        WHERE  pc.product = p.id
      ) cat
    `;
const getAllProducts = async (req, res) => {
  try {
    const { rows: productRows } = await pool.query(getProductQuery);

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
      getProductQuery + ` WHERE p.id=$1`,
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

  const { title, description, categories } = req.body;
  try {
    const insertQuery = {
      text: `INSERT INTO product (title, description) VALUES ($1, $2) RETURNING *`,
      values: [title, description],
    };
    const queryResult = await pool.query(insertQuery);
    const productId = queryResult.rows[0].id;
    queryResult.rows[0].category = await createProductCategoryMapping(
      categories,
      productId
    );
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
  const { title, description, categories } = req.body;
  try {
    const updateQuery = {
      text: `UPDATE product SET title=$1, description=$2 WHERE ID=$3 RETURNING *`,
      values: [title, description, id],
    };
    const queryResult = await pool.query(updateQuery);
    if (categories) {
      await pool.query(`DELETE FROM productCategory WHERE product=$1`, [id]);
      queryResult.rows[0].category = await createProductCategoryMapping(
        categories,
        id
      );
    }

    res.send(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteProductCategoryQueryResult = await pool.query(
      `DELETE FROM productCategory WHERE product=$1`,
      [id]
    );
    const deleteProductQuery = {
      text: `DELETE FROM product WHERE id=$1 RETURNING *`,
      values: [id],
    };
    const deleteProductQueryResult = await pool.query(deleteProductQuery);
    if (deleteProductQueryResult.rowCount === 0) {
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

async function createProductCategoryMapping(categories, id) {
  const categoriesResult = await categories.map((category) => {
    return pool.query(
      `
          INSERT INTO productCategory (product, category) 
          VALUES ($1, $2) 
          RETURNING *`,
      [id, category]
    );
  });

  const category = await Promise.all(categoriesResult);
  return category.map((result) => result.rows);
}

module.exports = {
  getAllProducts,
  getSingleProduct,
  createNewProduct,
  updateProduct,
  deleteProduct,
};
