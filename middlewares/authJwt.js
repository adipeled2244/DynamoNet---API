const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_PRIVATE_KEY || "jwtPrivateKey";
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
verifyToken = (req, res, next) => {
  let token = req.headers.Authorization;
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded._id;
    next();
  });
};

verifyModerator = (req, res, next) => {
  User.findOne({ _id: req.userId })
    .then((user) => {
      if (!user || !user.moderator) {
        errorLogger.error(`user has no moderator permissions ${req.userId}`);
        res.status(403).json({ message: `Require Moderator Permissions!` });
      }
      next();
      return;
    })
    .catch((err) => {
      errorLogger.error(`Error Getting user from db:${err}`);
      res.status(403).json({ message: `Access Denied!` });
    });
};

const authJwt = {
  verifyToken,
  verifyModerator,
};

module.exports = authJwt;
