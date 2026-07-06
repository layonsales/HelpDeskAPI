import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { Admin, Customer, Technical } from "../generated/prisma/client";
import z from "zod";
import { prismaDataBase } from "../database/prismaDataBase";
import { compare } from "bcrypt";
import { authConfig } from "../configs/auth";
import Jwt from "jsonwebtoken";

class SessionController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      email: z.email().trim(),
      password: z.string().trim(),
    });

    const { email, password } = bodySchema.parse(request.body);

    let user: Admin | Customer | Technical | null = null;

    let role: "admin" | "cliente" | "tecnico";

    user = await prismaDataBase.admin.findUnique({
      where: { email },
    });

    if (user) {
      role = "admin";
    } else {
      user = await prismaDataBase.customer.findUnique({
        where: { email },
      });

      if (user) {
        role = "cliente";
      } else {
        user = await prismaDataBase.technical.findUnique({
          where: { email },
        });

        if (!user) {
          throw new AppError("Invalid email or password", 404);
        }

        role = "tecnico";
      }
    }

    const matchedPassword = await compare(password, user.password);

    if (!matchedPassword) {
      throw new AppError("Invalid email or password", 404);
    }

    const { expiresIn, secret } = authConfig.jwt;

    if (user) {
      const token = Jwt.sign({ role }, secret, {
        subject: user.id,
        expiresIn,
      });

      const { password: _, ...userWithoutPassword } = user;

      response.status(200).json({ token, userWithoutPassword });
    }
  }
}

export { SessionController };
