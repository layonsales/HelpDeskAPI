import { Request, Response } from "express";
import { prismaDataBase } from "../database/prismaDataBase";
import { z } from "zod";
import { AppError } from "../utils/AppError";

class CallController {
  async create(request: Request, response: Response) {
    const paramSchema = z.object({
      id: z.uuid(),
    });

    const bodySchema = z.object({
      service_id: z.uuid(),
      description: z.string().trim(),
      technical_id: z.uuid(),
    });

    const { id } = paramSchema.parse(request.params);
    const { technical_id, description, service_id } = bodySchema.parse(
      request.body,
    );

    const service = await prismaDataBase.service.findUnique({
      where: { id: service_id },
    });

    if (!service) {
      throw new AppError("Service not found", 404);
    }

    const call = await prismaDataBase.call.create({
      data: {
        customer_id: id,
        technical_id: technical_id,
        description: description,
      },
    });

    await prismaDataBase.callService.create({
      data: {
        call_id: call.id,
        service_id: service_id,
        price: service.price,
        added_by: technical_id,
      },
    });

    return response.status(200).json(call);
  }
}

export { CallController };
