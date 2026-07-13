import { Request, Response } from "express";
import { prismaDataBase } from "../database/prismaDataBase";
import z from "zod";
import { Prisma } from "../generated/prisma/client";

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
    const service = await prismaDataBase.service.findMany();

    return response.status(200).json(service);
  }

  async patch(request: Request, response: Response) {
    const bodySchema = z
      .object({
        description: z.string().trim(),
        price: z.coerce.number().positive(),
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
    const bodySchema = z.object({
      active: z.boolean(),
    });

    const paramSchema = z.object({
      id: z.uuid(),
    });

    const { active } = bodySchema.parse(request.body);
    const { id } = paramSchema.parse(request.params);

    await prismaDataBase.service.update({
      data: {
        active: active,
      },
      where: { id },
    });

    return response.status(200).json({ message: "Service Deactivated" });
  }
}

export { ServicesController };
