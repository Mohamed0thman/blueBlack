const jwt = require("jsonwebtoken");

const jwtGenerator = (user_id) => {
  const playload = {
    user: {
      id: user_id,
    },
  };

  console.log(playload);

  return jwt.sign(playload, process.env.JWT_SECRET, { expiresIn: "10h" });
};

module.exports = jwtGenerator;
