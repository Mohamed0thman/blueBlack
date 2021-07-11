const express = require("express");
const router = new express.Router();
const db = require("../db/index");
const fs = require("fs");
const upload = require("../utiles/multer");

router.post("/api/galleries", async (req, res) => {
  console.log(req.body);
  const { title, product_id } = req.body;

  try {
    const gallery = await db.query(
      `INSERT INTO product_galleries ( title, product_id) values ($1, $2) returning *`,
      [title, product_id]
    );

    console.log(gallery);
    res.status(200).json({
      status: "success",
      results: gallery.rows.length,
      galleryId: gallery.rows[0].gallery_id,
      data: {
        galleries: [{ ...gallery.rows[0], images: [] }],
      },
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/api/galleries/:productId", async (req, res) => {
  console.log("productId", req.params.productId);
  try {
    const galleries = await db.query(
      `select  g.*,
      COALESCE( json_agg(i.*) FILTER (WHERE i.image_id  IS NOT NULL), '[]') AS "images"
      from product_galleries as g
      left join images as i using(gallery_id) 
      where product_id = $1
      GROUP by g.gallery_id
      order by g.gallery_id 
     `,
      [req.params.productId]
    );

    console.log("galleries", galleries.rows);
    res.status(200).json({
      status: "success",
      results: galleries.rows.length,
      data: {
        galleries: galleries.rows,
      },
    });
  } catch (err) {
    console.log(err);
  }
});

router.delete("/api/galleries/:galleryId", async (req, res) => {
  try {
    const images = await db.query(
      "select * from images where gallery_id = $1 ",
      [req.params.galleryId]
    );
    console.log(images);
    for (const image of images.rows) {
      fs.unlinkSync(`upload/${image.image_url}`);
    }
    const gallery = await db.query(
      "delete from product_galleries where gallery_id = $1 returning *",
      [req.params.galleryId]
    );

    res.status(200).json({
      status: "success",
      results: gallery.rows.length,
      data: {
        galleries: gallery.rows[0],
      },
    });
  } catch (err) {
    console.log(err);
  }
});

router.post(
  "/api/images/:galleryId",
  upload.single("image"),
  async (req, res) => {
    console.log(req.file);
    try {
      const file = req.file;

      const image = await db.query(
        `INSERT INTO images ( gallery_id,  image_url) values ($1, $2) returning *`,
        [req.params.galleryId, file.filename]
      );

      console.log(image);
      res.status(200).json({
        message: "image uploaded successfilly",
        data: {
          images: image.rows,
        },
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        message: "error",
      });
    }
  }
);

router.delete("/api/admin/image/:imageId", async (req, res) => {
  try {
    const images = await db.query(
      "delete from images where image_id = $1 returning *",
      [req.params.imageId]
    );
    console.log(images);
    for (const file of images) {
      fs.unlinkSync(file);
    }
    res.status(200).json({
      status: "success",
      results: images.rows.length,
      galleries: images.rows,
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
