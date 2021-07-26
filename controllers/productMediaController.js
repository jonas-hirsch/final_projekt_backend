const { Pool } = require("pg");
const pool = new Pool();
const { validationResult } = require("express-validator");
const path = require("path");
const { unlink } = require("fs");

const getMediaForProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const getMediaQuery = {
      text: `SELECT * FROM media WHERE product = $1 `,
      values: [productId],
    };
    const queryResult = await pool.query(getMediaQuery);

    res.send(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const uploadProductMedia = async (req, res) => {
  const { productId } = req.params;
  let errorOccured = false;

  const mediaPromises = req.files.map(async (fileObject) => {
    console.log("TYPE: " + fileObject.mediaType);
    try {
      const insertQuery = {
        text: `Insert INTO media (product, type, path) VALUES ($1, $2, $3) RETURNING *`,
        values: [productId, fileObject.mediaType, fileObject.path],
      };
      const { rows } = await pool.query(insertQuery);
      return { ...rows[0] };
    } catch (e) {
      console.log({ Error: e.message });
      errorOccured = true;
      return "Failed to upload a product media: " + e.message;
    }
  });

  const mediaRows = await Promise.all(mediaPromises);
  if (errorOccured) {
    res.status(500).send(mediaRows);
  } else {
    res.send(mediaRows);
  }
};

const deleteMedia = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteQuery = {
      text: `DELETE FROM media WHERE id=$1 RETURNING *`,
      values: [id],
    };
    const queryResult = await pool.query(deleteQuery);
    if (queryResult.rowCount === 0) {
      return res
        .status(404)
        .send(
          `The product media with the ID ${id} does not exist in the database. Delete failed.`
        );
    }

    unlink("./public/uploads/" + queryResult.rows[0].path, (err) => {
      if (err) console.error("Failed to delete the file: " + err);
    });
    res.send(`Successfully delete the product media with the ID ${id}.`);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

module.exports = {
  getMediaForProduct,
  uploadProductMedia,
  deleteMedia,
};
