const db = require("../db/index");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      return res.status(403).json({ msg: "authorization denied" });
    }
    const verify = jwt.verify(token, process.env.JWT_SECRET);

    req.user = verify.user;
    next();
  } catch (err) {
    res.status(401).send({ Error: "plese auth" });
  }
};

function userRole(role) {
  return async (req, res, next) => {
    const premission = await db.query(
      "select * from roles where role_id = $1 and name = $2",
      [req.params.roleId, role]
    );
    if (premission.rows.length === 0) {
      res.status(200);
      return res.send(false);
    }

    next();
  };
}

module.exports = { auth, userRole };
