import { Request, Response } from "express";
import { z } from "zod";
import { hash } from "bcrypt";
import { prismaDataBase } from "../database/prismaDataBase";

/**
 * Admin controller
 */
class AdminController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().min(3).trim(),
      email: z.email().trim(),
      password: z.string().trim(),
    });

    const { name, email, password } = bodySchema.parse(request.body);

    const hashesPassword = await hash(password, 8);

    const admin = await prismaDataBase.admin.create({
      data: {
        name: name,
        email: email,
        password: hashesPassword,
      },
    });

    const { password: _, ...adminWithoutPassword } = admin;

    return response.status(200).json({ admin: adminWithoutPassword });
  }

  async index(request: Request, response: Response) {
    const admin = await prismaDataBase.admin.findMany();

    return response.status(200).json({ admin });
  }

  async patch(request: Request, response: Response) {
    const paramSchema = z.object({
      id: z.uuid(),
    });

    const bodySchema = z.object({
      email: z.email().trim(),
      password: z.string().trim(),
    });

    const { email, password } = bodySchema.parse(request.body);

    const { id } = paramSchema.parse(request.params);

    const updatedAdmin = await prismaDataBase.admin.update({
      where: { id },
      data: {
        email: email,
        password: password,
      },
    });

    return response.status(200).json({ updatedAdmin });
  }

  async delete(request: Request, response: Response) {
    const paramSchema = z.object({
      id: z.uuid(),
    });

    const { id } = paramSchema.parse(request.params);

    await prismaDataBase.admin.delete({
      where: { id },
    });

    return response.status(200).json({ message: "Admin deleted" });
  }
}

export { AdminController };
