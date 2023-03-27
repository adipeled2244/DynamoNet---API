const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_PRIVATE_KEY || "jwtPrivateKey";
const userService = require("../services/userService");
// // middleware to check if user is authenticated
// app.use((req, res, next) => {
//   if (req.headers.authorization) {
//     const token = req.headers.authorization.split(" ")[1];
//     const user = jwt.verify(token, process.env.JWT_SECRET);
//     if (user) {
//       req.user = user;
//     }
//   }
//   next();
// });
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
    const user = await userService.getUser(req.userId);
    if (user) {
      if (!user.tokenExp || user.tokenExp < new Date()) {
        return res.status(400).json({ message: "Token expired" });
      }
      if (!user.token || user.token !== token) {
        return res.status(400).json({ message: "Invalid token" });
      }
    }
    next();
  });
};

const authJwt = {
  verifyToken,
};

module.exports = authJwt;
