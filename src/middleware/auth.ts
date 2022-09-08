/** Middleware for handling req authorization for routes. */

import { NextFunction } from "express";
import jwt from "jsonwebtoken";
const { SECRET_KEY } = require("../config");


/** Middleware: Authenticate user. */

function authenticateJWT(req: any, res: any, next: NextFunction) {
  try {
    const tokenFromBody = req.body._token;
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    req.user = payload; // create a current user
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req: any, res: any, next: NextFunction) {
  if (!req.user) {
    return next({ status: 401, message: "Unauthorized" });
  } else {
    return next();
  }
}

/**
 * Middleware: Requires correct username.
 *
 * Not sure this is standard, since it requires a JSON body in a GET request for some routes
 * */

function ensureCorrectUser(req: any, res: any, next: NextFunction) {
  try {
    if (req.user.username === req.params.username) {
      return next();
    } else {
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}
// end

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser
};
