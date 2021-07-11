const express = require("express");
const router = new express.Router();
const bcrybt = require("bcrypt");

const db = require("../db/index");

const jwtGenerator = require("../utiles/jwtGenerator");
const { auth, userRole } = require("../middleware/auth");

router.post("/api/users/register", async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  const now = new Date();

  try {
    if (password !== confirmPassword) {
      return res.status(401).json("not match");
    }
    const user = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length > 0) {
      return res.status(401).json("user already exist!");
    }
    const salt = await bcrybt.genSalt(10);

    const bcryptPassword = await bcrybt.hash(password, salt);

    const newUser = await db.query(
      "INSERT INTO users (email, password, created_at, updated_at ) values ($1, $2, $3, $4) returning *",
      [email, bcryptPassword, now, now]
    );

    const customerId = "32f85af8-52ce-4657-b4ba-f687e9456bd7";
    const userRole = await db.query(
      "INSERT INTO user_roles (role_id,user_id) values ($1, $2) returning *",
      [customerId, newUser.rows[0].user_id]
    );

    const jwtToken = jwtGenerator(newUser.rows[0].user_id);

    res.status(200).json({
      status: "success",
      results: newUser.rows.length,

      data: {
        userId: newUser.rows[0].user_id,
        email: newUser.rows[0].email,
        role: userRole.rows[0].role_id,
        token: jwtToken,
      },
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.query(
      "SELECT * FROM users join user_roles USING(user_id) WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json("invalid Credential");
    }

    const validPassword = await bcrybt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return res.status(401).json("invalid Credential");
    }

    const jwtToken = jwtGenerator(user.rows[0].user_id);

    console.log(jwtToken);
    res.status(200).json({
      status: "success",
      results: user.rows.length,

      data: {
        userId: user.rows[0].user_id,
        email: user.rows[0].email,
        role: user.rows[0].role_id,
        token: jwtToken,
      },
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/api/premission/:roleId", auth, userRole("admin"), (req, res) => {
  res.status(200).send(true);
});

router.get("/api/user/:id", auth, async (req, res) => {
  try {
    const user = await db.query(
      "SELECT user_id, email FROM users WHERE user_id = $1",
      [req.params.id]
    );

    res.status(200).json({
      status: "success",
      results: user.rows.length,

      data: {
        user: user.rows[0],
      },
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
