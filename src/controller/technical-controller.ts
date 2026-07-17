import { Request, Response } from "express";
import { prismaDataBase } from "../database/prismaDataBase";
import z from "zod";
import { hash } from "bcrypt";

class TechnicalController {
  async create(request: Request, response: Response) {
    const periodSchema = z.object({
      start: z.string(),
      end: z.string(),
    });

    const bodySchema = z.object({
      name: z.string().trim().min(3),
      email: z.email().trim().toLowerCase(),
      password: z.string().trim().min(6),
      available_hours: periodSchema,
    });

    const { name, email, password, available_hours } = bodySchema.parse(
      request.body,
    );

    const hashedPassword = await hash(password, 8);

    const technical = await prismaDataBase.technical.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        available_hours: available_hours,
      },
    });

    const { password: _, ...technicalWithoutPassword } = technical;

    return response.status(200).json({ technical: technicalWithoutPassword });
  }

  async index(request: Request, response: Response) {
    const technical = await prismaDataBase.technical.findMany();

    return response.status(200).json({ technical });
  }

  async patch(request: Request, response: Response) {
    const paramSchema = z.object({
      id: z.uuid(),
    });

    const bodySchema = z.object({
      email: z.email().trim().toLowerCase(),
    });

    const { id } = paramSchema.parse(request.params);
    const { email } = bodySchema.parse(request.body);

    await prismaDataBase.technical.update({
      data: {
        email: email,
      },
      where: { id },
    });

    return response.status(200).json("Technical email updated");
  }

  async changeHours(request: Request, response: Response) {
    const paramSchema = z.object({
      id: z.uuid(),
    });

    const periodSchema = z.object({
      start: z.string(),
      end: z.string(),
    });

    const bodySchema = z.object({
      available_hours: periodSchema,
    });

    const { id } = paramSchema.parse(request.params);
    const { available_hours } = bodySchema.parse(request.body);

    await prismaDataBase.technical.update({
      data: {
        available_hours: available_hours,
      },
      where: { id },
    });

    return response
      .status(200)
      .json({ Message: "Technical Available Hours Updated" });
  }

  async changePassword(request: Request, response: Response) {
    const paramSchema = z.object({
      id: z.uuid(),
    });

    const bodySchema = z.object({
      password: z.string().trim().min(6),
    });

    const { id } = paramSchema.parse(request.params);
    const { password } = bodySchema.parse(request.body);

    const hashedPassword = await hash(password, 8);

    await prismaDataBase.technical.update({
      data: {
        password: hashedPassword,
        must_change_password: true,
      },
      where: { id },
    });

    return response.status(200).json({ message: "Password Updated" });
  }

  async delete(request: Request, response: Response) {
    const paramSchema = z.object({
      id: z.uuid(),
    });

    const { id } = paramSchema.parse(request.params);

    await prismaDataBase.technical.delete({
      where: { id },
    });

    return response.status(200).json({ message: "Technical deleted" });
  }
}

export { TechnicalController };
