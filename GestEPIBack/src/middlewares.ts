import { NextFunction, Request, Response } from "express";
import { ValidationOptions, RequestMethod } from "./models/types";

export const notFound = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
};

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response
): void => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

/**
 * Middleware pour valider les requêtes selon leur méthode et les critères spécifiés
 * @param method La méthode HTTP à valider
 * @param options Options de validation (minLength ou exactLength)
 */
// Le middleware possède pas mal de bugs car on n'utilise plus que req.query
    // TODO: à refaire
export const validateRequest = (method: string, options: ValidationOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
};