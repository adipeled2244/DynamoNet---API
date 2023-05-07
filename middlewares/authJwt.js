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
    try {
      const user = await userService.getUser(req.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      // if (user.token !== token) {
      //   res.status(401).json({ message: "Unauthorized!" });
      //   return;
      // }
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
