const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_PRIVATE_KEY || "jwtPrivateKey";
const userService = require("../services/userService");

const verifyToken = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }
  jwt.verify(token, SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded._id;
    try {
      const user = await userService.getUser(req.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      req.user = user;
    } catch (error) {
      res.status(500).json({ message: "Server error" });
      return;
    }
    next();
  });
};

const authJwt = {
  verifyToken,
};

module.exports = authJwt;
