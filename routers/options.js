const express = require("express");
const router = new express.Router();
const db = require("../db/index");

router.post("/api/admin/options/sizes", async (req, res) => {
  const { size_name, size_code } = req.body;

  try {
    const sizes = await db.query(
      `INSERT INTO sizes ( size_name, size_code) values ($1, $2) returning *`,
      [size_name, size_code]
    );

    const formateSize = sizes.rows.map((size) => ({
      id: size.size_id,
      name: size.size_name,
      code: size.size_code,
    }));

    console.log(formateSize);
    console.log(sizes);
    res.status(200).json({
      status: "success",
      results: formateSize.length,
      sizes: formateSize,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/api/admin/options/sizes", async (req, res) => {
  try {
    const sizes = await db.query("select * from sizes");

    const formatSize = sizes.rows.map((size) => ({
      id: size.size_id,
      name: size.size_name,
      code: size.size_code,
    }));
    console.log(formatSize);
    res.status(200).json({
      status: "success",
      results: formatSize.length,
      sizes: formatSize,
    });
  } catch (err) {
    console.log(err);
  }
});

router.delete("/api/admin/options/sizes/:id", async (req, res) => {
  console.log(req.params.id);
  try {
    const sizes = await db.query(
      "delete from sizes where size_id = $1 returning *",
      [req.params.id]
    );

    const formateSize = sizes.rows.map((size) => ({
      id: size.size_id,
      name: size.size_name,
      code: size.size_code,
    }));
    console.log(sizes);
    res.status(200).json({
      status: "success",
      results: formateSize.length,
      sizes: formateSize[0],
    });
  } catch (err) {
    console.log(err);
  }
});

////////////////////// color ////////////////////////////

router.post("/api/admin/options/colors", async (req, res) => {
  const { color_name, color_code } = req.body;

  try {
    const colors = await db.query(
      `INSERT INTO colors ( color_name, color_code ) values ($1, $2) returning *`,
      [color_name, color_code]
    );
    console.log(colors);

    const formateColor = colors.rows.map((color) => ({
      id: color.color_id,
      name: color.color_name,
      code: color.color_code,
    }));

    console.log(formateColor);
    res.status(200).json({
      status: "success",
      results: formateColor.length,
      colors: formateColor,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/api/admin/options/colors", async (req, res) => {
  try {
    const colors = await db.query("select * from colors");

    console.log(colors);

    const formateColor = colors.rows.map((color) => ({
      id: color.color_id,
      name: color.color_name,
      code: color.color_code,
    }));
    console.log(formateColor);
    res.status(200).json({
      status: "success",
      results: formateColor.length,
      colors: formateColor,
    });
  } catch (err) {
    console.log(err);
  }
});

router.delete("/api/admin/options/colors/:id", async (req, res) => {
  console.log(req.params.id);
  try {
    const colors = await db.query(
      "delete from colors where color_id = $1 returning *",
      [req.params.id]
    );

    console.log(colors);
    const formateColor = colors.rows.map((color) => ({
      id: color.color_id,
      name: color.color_name,
      code: color.color_code,
    }));

    console.log(formateColor);
    res.status(200).json({
      status: "success",
      results: formateColor.length,
      colors: formateColor[0],
    });
  } catch (err) {
    console.log(err);
  }
});

/////////// option /////////////////////

router.post("/api/admin/options", async (req, res) => {
  const { option_name } = req.body;

  try {
    const options = await db.query(
      `INSERT INTO option ( option_name) values ($1) returning *`,
      [option_name]
    );

    const formateOptions = options.rows.map((option) => ({
      id: option.option_id,
      name: option.option_name,
    }));

    console.log(formateOptions);
    res.status(200).json({
      status: "success",
      results: formateOptions.length,
      options: formateOptions,
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/api/admin/option/values", async (req, res) => {
  const { value_name, value_code } = req.body;

  try {
    const values = await db.query(
      `INSERT INTO option_values ( value_name,value_code) values ($1) returning *`,
      [value_name, value_code]
    );

    const formateValues = values.rows.map((value) => ({
      id: value.value_id,
      name: value.value_name,
      code: value.value_code,
    }));

    console.log(formateValues);
    res.status(200).json({
      status: "success",
      results: formateValues.length,
      values: formateValues,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/api/admin/options", async (req, res) => {
  try {
    const options = await db.query(`
        select o.option_id, o.option_name, COALESCE(json_agg(v.*) FILTER (WHERE v.value_id  IS NOT NULL), '[]' ) as "values"
        from "options" as o
        left join option_values as v using(option_id)
        group by option_id,option_name
        `);

    const formateOptions = options.rows.map((option) => ({
      id: size.size_id,
      name: option.option_name,
      values: optio.values,
    }));
    console.log(formatSize);
    res.status(200).json({
      status: "success",
      results: formateOptions.length,
      options: formateOptions,
    });
  } catch (err) {
    console.log(err);
  }
});

router.delete("/api/admin/options/sizes/:id", async (req, res) => {
  console.log(req.params.id);
  try {
    const sizes = await db.query(
      "delete from sizes where size_id = $1 returning *",
      [req.params.id]
    );

    const formateSize = sizes.rows.map((size) => ({
      id: size.size_id,
      name: size.size_name,
      code: size.size_code,
    }));
    console.log(sizes);
    res.status(200).json({
      status: "success",
      results: formateSize.length,
      sizes: formateSize[0],
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
