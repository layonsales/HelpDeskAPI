import { Request, Response, NextFunction } from "express";
import { authConfig } from "../configs/auth";
import { AppError } from "../utils/AppError";
import Jwt from "jsonwebtoken";

interface TokenPayload {
  role: string;
  sub: string;
}

function ensureAuthorization(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const authTokenHeader = request.headers.authorization;

    if (!authTokenHeader) {
      throw new AppError("JWT token not found");
    }

    const [, token] = authTokenHeader.split(" ");

    if (!token) {
      throw new AppError("JWT token not found");
    }

    const secret = authConfig.jwt.secret;

    if (!secret) {
      throw new AppError("JWT secret is missing", 500);
    }

    const decoded = Jwt.verify(token, secret) as unknown as TokenPayload;

    request.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    console.log(error);
    return next(new AppError("Invalid JWT token", 401));
  }
}

export { ensureAuthorization };
