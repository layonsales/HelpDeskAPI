import { Request, Response } from "express";
import { prismaDataBase } from "../database/prismaDataBase";
import z from "zod";
import { Prisma } from "../generated/prisma/client";
import { AppError } from "../utils/AppError";

class ServicesController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      description: z.string().trim(),
      price: z.coerce.number().positive(),
    });

    const { description, price } = bodySchema.parse(request.body);

    const services = await prismaDataBase.service.create({
      data: {
        description: description,
        price: new Prisma.Decimal(price),
      },
    });

    return response.status(201).json(services);
  }

  async index(request: Request, response: Response) {
    const active = true;
    const service = await prismaDataBase.service.findMany({
      where: { active },
    });

    return response.status(200).json(service);
  }

  async patch(request: Request, response: Response) {
    const bodySchema = z
      .object({
        description: z.string().trim().optional(),
        price: z.coerce.number().positive().optional(),
      })
      .refine(
        (data) => data.description !== undefined || data.price !== undefined,
        {
          error: "Informe pelo menos description ou price",
        },
      );

    const paramSchema = z.object({
      id: z.uuid(),
    });

    const { description, price } = bodySchema.parse(request.body);
    const { id } = paramSchema.parse(request.params);

    const serviceExists = await prismaDataBase.service.findUnique({
      where: {
        id,
      },
    });

    if (!serviceExists) {
      throw new AppError("Service not found", 404);
    }

    const data: {
      description?: string;
      price?: Prisma.Decimal;
    } = {};

    if (description !== undefined) {
      data.description = description;
    }

    if (price !== undefined) {
      data.price = new Prisma.Decimal(price);
    }

    const service = await prismaDataBase.service.update({
      where: { id },
      data,
    });

    return response.status(200).json(service);
  }

  async deactivate(request: Request, response: Response) {
    const paramSchema = z.object({
      id: z.uuid(),
    });

    const { id } = paramSchema.parse(request.params);

    const service = await prismaDataBase.service.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      throw new AppError("Service not found", 404);
    }

    if (!service.active) {
      throw new AppError("Service is already inactive", 400);
    }

    await prismaDataBase.service.update({
      data: {
        active: false,
      },
      where: { id },
    });

    return response.status(200).json({ message: "Service Deactivated" });
  }
}

export { ServicesController };
