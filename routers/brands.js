const express = require("express");
const router = new express.Router();
const db = require("../db/index");

router.post("/api/brands", async (req, res) => {
  const { brand_name, order } = req.body;

  try {
    const brands = await db.query(
      `INSERT INTO brands ( brand_name, "order") values ($1, $2) returning *`,
      [brand_name, order]
    );
    console.log(brands);

    const formatBrand = brands.rows.map((brand) => ({
      id: brand.brand_id,
      name: brand.brand_name,
    }));
    res.status(200).json({
      status: "success",
      results: formatBrand.length,
      brands: formatBrand,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/api/brands", async (req, res) => {
  try {
    const brands = await db.query("select * from brands");

    console.log(brands);

    const formatBrand = brands.rows.map((brand) => ({
      id: brand.brand_id,
      name: brand.brand_name,
    }));

    res.status(200).json({
      status: "success",
      results: formatBrand.length,
      brands: formatBrand,
    });
  } catch (err) {
    console.log(err);
  }
});

router.delete("/api/brands/:id", async (req, res) => {
  try {
    const brands = await db.query(
      "delete from brands where brand_id = $1 returning *",
      [req.params.id]
    );
    const formatBrand = brands.rows.map((brand) => ({
      id: brand.brand_id,
      name: brand.brand_name,
    }));
    console.log(formatBrand);
    res.status(200).json({
      status: "success",
      results: formatBrand.length,
      brands: formatBrand[0],
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
