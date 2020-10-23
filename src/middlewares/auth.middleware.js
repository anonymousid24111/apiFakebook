import jwtHelper from "../helpers/jwt.helper.js";

const accessTokenSecret =
  process.env.ACCESS_TOKEN_SECRET || "accessTokenSecret";

let isAuth = async (req, res, next) => {
  const tokenFromClient =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (tokenFromClient) {
    try {
      const decoded = await jwtHelper.verifyToken(
        tokenFromClient,
        accessTokenSecret
      );
      // console.log(decoded)
      req.jwtDecoded = decoded;

      next();
    } catch (error) {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }
  } else {
    return res.status(403).json({
      message: "No token provided.",
    });
  }
};

export default {
  isAuth: isAuth,
};
