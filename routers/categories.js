const express = require("express");
const router = new express.Router();
const db = require("../db/index");

router.post("/api/admin/categories", async (req, res) => {
  const { category_name, order } = req.body;
  console.log(category_name, parseInt(order, 10));

  try {
    const categories = await db.query(
      `INSERT INTO categories (category_name, "order") values ($1, $2) returning *`,
      [category_name, parseInt(order, 10)]
    );

    const formatCategories = categories.rows.map((category) => ({
      id: category.category_id,
      name: category.category_name,
    }));

    console.log(categories);
    res.status(200).json({
      status: "success",
      results: formatCategories.length,
      categories: [{ ...formatCategories[0], subcategories: [] }],
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/api/admin/categories", async (req, res) => {
  try {
    const categories = await db.query(
      `
      select c.*,  COALESCE( json_agg(s.* ORDER BY s.order) FILTER (WHERE s.subcategory_id  IS NOT NULL), '[]') AS "subcategories"  
      from Categories  as c
      left join  subcategories as s USING(category_id)
      GROUP by c.category_id
      order by c.order
      `
    );

    console.log(categories);

    const formatCategories = categories.rows.map((category) => ({
      id: category.category_id,
      name: category.category_name,
      subcategories: category.subcategories.map((subcategory) => {
        return {
          id: subcategory.subcategory_id,
          name: subcategory.subcategory_name,
        };
      }),
    }));

    console.log(formatCategories);

    res.status(200).json({
      status: "success",
      results: formatCategories.length,
      categories: formatCategories,
    });
  } catch (err) {
    console.log(err);
  }
});

router.delete("/api/admin/categories/:categoryId", async (req, res) => {
  console.log(req.params.categoryId);
  try {
    const categories = await db.query(
      "delete from categories where category_id = $1 returning *",
      [req.params.categoryId]
    );

    const formatCategories = categories.rows.map((category) => ({
      id: category.category_id,
      name: category.category_name,
    }));

    res.status(200).json({
      status: "success",
      results: formatCategories.length,
      categories: formatCategories[0],
    });
  } catch (err) {
    console.log(err);
  }
});

/////// subcategories route \\\\\\\\\

router.post("/api/admin/subcategories", async (req, res) => {
  const { category_id, subcategory_name, order } = req.body;

  console.log(category_id);
  console.log(subcategory_name);

  try {
    const subcategories = await db.query(
      'INSERT INTO subcategories ( category_id, subcategory_name, "order") values ($1, $2,$3) returning *',
      [category_id, subcategory_name, parseInt(order, 10)]
    );
    console.log(subcategories);
    const formatsubcategories = subcategories.rows.map((subcategory) => ({
      id: subcategory.subcategory_id,
      name: subcategory.subcategory_name,
    }));
    res.status(200).json({
      status: "success",
      results: formatsubcategories.length,
      subcategories: formatsubcategories[0],
      category_id: subcategories.rows[0].category_id,
    });
  } catch (err) {
    console.log(err);
  }
});

router.delete("/api/admin/subcategories/:subcategoryId", async (req, res) => {
  console.log(req.params.subcategoryId);
  try {
    const subcategories = await db.query(
      "delete from subcategories where subcategory_id = $1 returning *",
      [req.params.subcategoryId]
    );

    console.log(subcategories);
    const formatsubcategories = subcategories.rows.map((subcategory) => ({
      id: subcategory.subcategory_id,
      name: subcategory.subcategory_name,
    }));
    console.log(formatsubcategories);
    res.status(200).json({
      status: "success",
      results: formatsubcategories.length,
      subcategories: formatsubcategories[0],
      category_id: subcategories.rows[0].category_id,
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
