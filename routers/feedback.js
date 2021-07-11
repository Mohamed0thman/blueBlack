const express = require("express");
const router = new express.Router();
const db = require("../db/index");
const { auth } = require("../middleware/auth");

router.post("/api/feedback", auth, async (req, res) => {
  const { product_id, customer_id, rating } = req.body;

  try {
    const feedback = await db.query(
      "INSERT INTO feedback ( product_id, customer_id, rating) values ($1, $2, $3) returning *",
      [product_id, customer_id, rating]
    );

    res.status(200).json({
      status: "success",
      results: feedback.rows.length,

      data: {
        feedback: feedback.rows[0],
      },
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
