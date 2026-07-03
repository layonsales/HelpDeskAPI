import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ZodError, z } from "zod";
/*
Middleware para tratamento de exceções
*/
export function errorHandler(
  error: any,
  request: Request,
  response: Response,
  next: NextFunction,
) {
  // Trata exceções lançadas por nós
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({ message: error.message });
  }

  // Tratando exceções de validação
  if (error instanceof ZodError) {
    return response.status(400).json({
      message: "Validation Error",
      issue: z.treeifyError(error),
    });
  }

  // Retorna exceção generica
  return response.status(500).json({ message: error.message });
}
