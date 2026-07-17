import { Request, Response } from "express";
import { prismaDataBase } from "../database/prismaDataBase";
import { uuid, z } from "zod";
import { AppError } from "../utils/AppError";
import { StatusCall } from "../generated/prisma/enums";

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

  async addService(request: Request, response: Response) {
    const paramsSchema = z.object({
      call_id: uuid(),
    });

    const bodySchema = z.object({
      service_id: z.uuid(),
    });

    const { call_id } = paramsSchema.parse(request.params);
    const { service_id } = bodySchema.parse(request.body);

    if (!request.user) {
      throw new AppError("Unauthorized", 401);
    }

    const technical_id = request.user.id;

    const call = await prismaDataBase.call.findUnique({
      where: {
        id: call_id,
      },
    });

    if (!call) {
      throw new AppError("Call not found", 404);
    }

    if (call.status === "closed") {
      throw new AppError(
        "It is not possible to add a service to a closed call",
        400,
      );
    }

    if (call.technical_id !== technical_id) {
      throw new AppError(
        "Only the technician responsible for the call can add services",
        403,
      );
    }

    const service = await prismaDataBase.service.findUnique({
      where: {
        id: service_id,
      },
    });

    if (!service) {
      throw new AppError("Service not found", 404);
    }

    if (!service.active) {
      throw new AppError("This service is inactive", 400);
    }

    const serviceAlreadyAdded = await prismaDataBase.callService.findUnique({
      where: {
        call_id_service_id: {
          call_id,
          service_id,
        },
      },
    });

    if (serviceAlreadyAdded) {
      throw new AppError(
        "This service has already been added to the call",
        409,
      );
    }

    const callService = await prismaDataBase.callService.create({
      data: {
        call_id,
        service_id,
        added_by: technical_id,
        price: service.price,
      },
      include: {
        serviceID: true,
        addedBY: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return response.status(201).json(callService);
  }

  async index(request: Request, response: Response) {
    const call = await prismaDataBase.call.findMany();

    return response.status(200).json(call);
  }

  async callByTechnical(request: Request, response: Response) {
    const paramSchema = z.object({
      id: z.uuid(),
    });

    const { id } = paramSchema.parse(request.params);

    const call = await prismaDataBase.call.findMany({
      where: {
        technical_id: id,
      },
    });

    return response.status(200).json(call);
  }

  async patchStatus(request: Request, response: Response) {
    const paramSchema = z.object({
      id: z.uuid(),
    });

    const bodySchema = z.object({
      status: z.enum(StatusCall),
    });

    const { id } = paramSchema.parse(request.params);
    const { status } = bodySchema.parse(request.body);

    await prismaDataBase.call.update({
      data: {
        status: status,
      },
      where: {
        id,
      },
    });

    return response.status(200).json({ message: "Call Status Updated" });
  }

  async delete(request: Request, response: Response) {
    const paramSchema = z.object({
      id: uuid(),
    });

    const { id } = paramSchema.parse(request.params);

    await prismaDataBase.call.delete({
      where: { id },
    });

    return response.status(200).json({ message: "Call deleted" });
  }
}

export { CallController };
