const express = require("express");
const router = new express.Router();
const fs = require("fs");
const db = require("../db/index");
const upload = require("../utiles/multer");
const { updateProductByID } = require("../models/product");

router.get("/", (req, res) => {
  res.send("welcome to backend");
});

router.post("/api/products", upload.single("image"), async (req, res) => {
  const { name, price, discount, category_id, subcategory_id, brand_id } =
    JSON.parse(req.body.document);
  const file = req.file;

  console.log(file);

  const now = new Date();

  try {
    const products = await db.query(
      "INSERT INTO products (category_id,subcategory_id,brand_id , product_name,price, discount, product_image, is_published, created_at,updated_at ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning *",
      [
        category_id,
        subcategory_id,
        brand_id,
        name,
        price,
        discount,
        file.filename,
        false,
        now,
        now,
      ]
    );
    const formatProduct = products.rows.map((product) => ({
      id: product.product_id,
      image: product.product_image,
      name: product.product_name,
      price: product.price,
      discount: product.discount ? product.discount * 100 + "%" : 0,
      quantity: product.quantity ? product.quantity : 0,
      rate: product.rate ? product.rate : 0,
    }));

    res.status(200).json({
      status: "success",
      results: formatProduct.length,
      products: formatProduct,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/api/products", async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const results = {};

  console.log(startIndex, endIndex);

  try {
    const products = await db.query(
      `select *,  count(*) OVER( )  AS full_count   from products as p  
      left join (select product_id, count(*), trunc(avg(rating),1)as average_rating from feedback 
      group by product_id)as feedback USING(product_id)  left join (select product_id, sum( quantity ) as quantity from variation  group by product_id) as variation using(product_id) ORDER BY product_id  OFFSET $1 ROWS FETCH first $2 ROW ONLY`,
      [startIndex, limit]
    );

    const fullCount =
      products.rows.length > 0 ? products.rows[0].full_count : 0;

    if (endIndex < fullCount) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    const formatProduct = products.rows.map((product) => ({
      id: product.product_id,
      image: product.product_image,
      name: product.product_name,
      price: product.price,
      discount: product.discount ? product.discount * 100 + "%" : 0,
      quantity: product.quantity ? product.quantity : 0,
      rating: product.rate ? product.rate : 0,
      isPublished: product.is_published,
    }));

    console.log(formatProduct);
    res.status(200).json({
      status: "success",
      results: fullCount,
      next: results.next,
      products: formatProduct,
    });
  } catch (err) {
    console.log(err),
      res.status(400).send({
        message: "not more item",
      });
  }
});

router.get("/api/products/:name", async (req, res) => {
  try {
    console.log(req.params.name);
    const products = await db.query(
      `select p.* , json_agg( v.*) as Variation from products as p 
      left join Variation as v USING(product_id)
      where p.product_name = $1
      GROUP by p.product_id
      `,
      [req.params.name]
    );
    console.log(products.rows);

    const formatProduct = products.rows.map((product) => ({
      productId: product.product_id,
      productName: product.product_name,
      productImage: product.product_image,
      productPrice: product.price,
      productDiscount: product.discount ? product.discount : 0,
      productQuantity: product.quantity ? product.quantity : 0,
      productRating: product.rate ? product.rate : 0,
      isPublished: product.is_published,
      categoryId: product.category_id,
      subcategoryId: product.subcategory_id,
      brandId: product.brand_id,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));

    res.status(200).json({
      status: "success",
      results: formatProduct.length,
      product: formatProduct[0],
    });
  } catch (err) {
    console.log(err);
  }
});

router.patch("/api/products/:id", async (req, res) => {
  try {
    const query = updateProductByID(req.params.id, req.body);

    const colValues = Object.keys(req.body).map(function (key) {
      return req.body[key];
    });

    const products = await db.query(query, colValues);
    console.log(products.rows);

    const formatProduct = products.rows.map((product) => ({
      productId: product.product_id,
      productName: product.product_name,
      productImage: product.product_image,
      productPrice: product.price,
      productDiscount: product.discount ? product.discount : 0,
      isPublished: product.is_published,
      categoryId: product.category_id,
      subcategoryId: product.subcategory_id,
      brandId: product.brand_id,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));

    res.status(200).json({
      status: "success",
      results: formatProduct.length,
      product: formatProduct[0],
    });
  } catch (err) {
    console.log(err);
  }
});

router.delete("/api/products/:id", async (req, res) => {
  try {
    const products = await db.query(
      "delete from products where product_id = $1 returning *",
      [req.params.id]
    );

    fs.unlinkSync(`upload/${products.rows[0].product_image}`);

    res.status(200).json({
      status: "success",
      productId: products.rows[0].product_id,
    });
  } catch (err) {
    console.log(err);
  }
});

///////////////////////variation/////////////////////////////

router.post("/api/admin/product-variation", async (req, res) => {
  const { product_id, size_id, color_id, gallery_id, extra_price, quantity } =
    req.body;

  console.log(req.body);

  try {
    const variantion = await db.query(
      `INSERT INTO variation ( product_id,size_id, color_id, gallery_id, extra_price, quantity) values ($1, $2, $3, $4, $5, $6) returning *`,
      [product_id, size_id, color_id, gallery_id, Number(extra_price), quantity]
    );
    console.log(variantion);

    res.status(200).json({
      status: "success",
      results: variantion.rows.length,
      variantion: variantion.rows[0],
    });
  } catch (err) {
    console.log(err);
  }
});

router.delete("/api/admin/product-variation/:id", async (req, res) => {
  try {
    const Variation = await db.query(
      `delete from variation where Variation_id = $1 returning *`,
      [req.params.id]
    );

    console.log(req.params.id);

    console.log(Variation);

    res.status(200).json({
      status: "success",
      results: Variation.rows.length,
      variantion: Variation.rows[0],
    });
  } catch (err) {
    console.log(err);
  }
});

//////////////////////////////////

router.get("/api/test", async (req, res) => {
  try {
    const products = await db.query(
      `
        select p.*,s.sku_id,
        COALESCE(   json_object_agg(o.option_name, v.*)FILTER (WHERE o.option_name  IS NOT NULL), '[]') AS "options"  
        from products as p
        left join product_skus as s using(product_id)
        left join sku_values as s_v using(sku_id)
        left join  "options"  as o using(option_id)
        left join option_values as v using(value_id)
        GROUP by p.product_id,s.sku_id
        `
    );
    const formate = products.rows.map((item) => ({
      variantion: item.options,
    }));

    console.log(products.rows);
    console.log(formate);

    res.status(200).json({
      status: "success",
      results: products.rows.length,
      product: products.rows,
    });
  } catch (err) {
    console.log(err);
  }
});

//// product_attribute
//// attribute_value
//// product_skus
//// skus_vlaue

router.post("/api/attributes", async (req, res) => {
  const { product_id, attribute_name } = req.body;

  try {
    const attributes = await db.query(
      `INSERT INTO attributes ( product_id, attribute_name) values ($1, $2) returning *`,
      [product_id, attribute_name]
    );
    console.log(attributes);

    res.status(200).json({
      status: "success",
      results: attributes.rows.length,
      brands: attributes.rows,
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
