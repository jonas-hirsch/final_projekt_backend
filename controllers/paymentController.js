const { Pool } = require("pg");
const pool = new Pool();
const { validationResult } = require("express-validator");
const stripe = require("stripe")(process.env.SECRET_KEY)


const createPayment = async (req, res) => {
    const {id} = req.params
    const { sum } = await calculateOrderAmount(id)

    console.log(typeof sum)
    console.log(sum)

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(sum), // 100
      currency: "eur"
    });

    res.send({
        clientSecret: paymentIntent.client_secret
      });
};

const calculateOrderAmount = async (id) => {
    let sum = 0
    try {
        const result = await pool.query(`SELECT * FROM orderItem WHERE customerOrder = $1`, [id])
        // console.log(result.rows)
        result.rows.forEach(item => {
            sum += item.amount * parseFloat(item.price).toFixed(2)
            console.log(sum)
        })
        return { sum }
    }
    catch (e) {
        console.error(e)
        return -1;
    }
    
};


module.exports = {
    createPayment,
  };