import { Request, Response } from "express";
import { prismaDataBase } from "../database/prismaDataBase";
import { uuid, z } from "zod";
import { AppError } from "../utils/AppError";
import { StatusCall } from "../generated/prisma/enums";
import { Prisma } from "../generated/prisma/client";

class CallController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      service_id: z.uuid(),
      description: z.string().trim().min(1),
      technical_id: z.uuid(),
    });

    const { technical_id, description, service_id } = bodySchema.parse(
      request.body,
    );

    if (!request.user) {
      throw new AppError("Unauthorized", 401);
    }

    // O cliente vem do token, não da URL.
    const customer_id = request.user.id;

    const technical = await prismaDataBase.technical.findUnique({
      where: {
        id: technical_id,
      },
    });

    if (!technical) {
      throw new AppError("Technical not found", 404);
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

    const result = await prismaDataBase.$transaction(async (transaction) => {
      const call = await transaction.call.create({
        data: {
          customer_id,
          technical_id,
          description,
        },
      });

      const callService = await transaction.callService.create({
        data: {
          call_id: call.id,
          service_id,
          price: service.price,
          added_by: null,
        },
        include: {
          serviceID: true,
        },
      });

      return {
        ...call,
        services: [callService],
        total: callService.price.toString(),
      };
    });

    return response.status(201).json(result);
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

    if (call.status !== StatusCall.currently_assisting_a_client) {
      throw new AppError(
        "Services can only be added while the call is in progress",
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
    if (!request.user) {
      throw new AppError("Unauthorized", 401);
    }

    const isCustomer = request.user.role === "cliente";

    const where: Prisma.CallWhereInput = isCustomer
      ? {
          customer_id: request.user.id,
        }
      : {};

    const calls = await prismaDataBase.call.findMany({
      where,
      include: {
        customerID: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        technicalID: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        callCallService: {
          include: {
            serviceID: {
              select: {
                id: true,
                description: true,
              },
            },

            addedBY: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const callsWithTotal = calls.map((call) => {
      const total = call.callCallService.reduce(
        (sum, callService) => sum.plus(callService.price),
        new Prisma.Decimal(0),
      );

      return {
        ...call,

        // Decimal é transformado em string para facilitar o JSON.
        total: total.toString(),
      };
    });

    return response.status(200).json(callsWithTotal);
  }

  //Método para o técnico listar seus próprios chamados
  async myCallsAsTechnical(request: Request, response: Response) {
    if (!request.user) {
      throw new AppError("Unauthorized", 401);
    }

    const technical_id = request.user.id;

    const calls = await prismaDataBase.call.findMany({
      where: {
        technical_id,
      },

      include: {
        callCallService: {
          include: {
            serviceID: true,

            addedBY: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        customerID: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const callsWithTotal = calls.map((call) => {
      const total = call.callCallService.reduce(
        (sum, callService) => sum.plus(callService.price),
        new Prisma.Decimal(0),
      );

      return {
        ...call,
        total: total.toString(),
      };
    });

    return response.status(200).json(callsWithTotal);
  }
  //Método para admin listar chamados de um técnico
  async callsByTechnicalForAdmin(request: Request, response: Response) {
    const paramSchema = z.object({
      technical_id: z.uuid(),
    });

    const { technical_id } = paramSchema.parse(request.params);

    const technical = await prismaDataBase.technical.findUnique({
      where: {
        id: technical_id,
      },

      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!technical) {
      throw new AppError("Technical not found", 404);
    }

    const calls = await prismaDataBase.call.findMany({
      where: {
        technical_id,
      },

      include: {
        callCallService: {
          include: {
            serviceID: true,

            addedBY: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        customerID: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const callsWithTotal = calls.map((call) => {
      const total = call.callCallService.reduce(
        (sum, callService) => sum.plus(callService.price),
        new Prisma.Decimal(0),
      );

      return {
        ...call,
        total: total.toString(),
      };
    });

    return response.status(200).json({
      technical,
      calls: callsWithTotal,
    });
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

    const call = await prismaDataBase.call.findUnique({
      where: {
        id,
      },
    });

    if (!call) {
      throw new AppError("Call not found", 404);
    }

    if (call.status === status) {
      throw new AppError("The call already has this status", 400);
    }

    const validTransitions: Record<StatusCall, StatusCall[]> = {
      [StatusCall.open]: [StatusCall.currently_assisting_a_client],

      [StatusCall.currently_assisting_a_client]: [StatusCall.closed],

      [StatusCall.closed]: [],
    };

    const transitionIsValid = validTransitions[call.status].includes(status);

    if (!transitionIsValid) {
      throw new AppError(
        `Invalid status transition: ${call.status} -> ${status}`,
        400,
      );
    }

    const updatedCall = await prismaDataBase.call.update({
      where: {
        id,
      },

      data: {
        status,
      },
    });

    return response.status(200).json({
      message: "Call status updated",
      call: updatedCall,
    });
  }

  async start(request: Request, response: Response) {
    const paramSchema = z.object({
      id: z.uuid(),
    });

    const { id } = paramSchema.parse(request.params);

    const technical_id = request.user?.id;

    const call = await prismaDataBase.call.findUnique({
      where: { id },
    });

    if (!call) {
      throw new AppError("Call not found", 404);
    }

    if (call.technical_id !== technical_id) {
      throw new AppError(
        "Only the technician responsible for the call can start it",
        403,
      );
    }

    if (call.status === StatusCall.currently_assisting_a_client) {
      throw new AppError("This call is already in progress", 400);
    }

    if (call.status === StatusCall.closed) {
      throw new AppError("This call can not be started", 400);
    }

    const updateCallStatus = await prismaDataBase.call.update({
      where: { id },
      data: {
        status: StatusCall.currently_assisting_a_client,
      },
    });

    return response
      .status(200)
      .json({ message: "Call service started", call: updateCallStatus });
  }

  async close(request: Request, response: Response) {
    const paramSchema = z.object({
      id: uuid(),
    });

    const { id } = paramSchema.parse(request.params);

    const technical_id = request.user?.id;

    const call = await prismaDataBase.call.findUnique({
      where: { id },
    });

    if (!call) {
      throw new AppError("Call not found", 404);
    }

    if (call.technical_id !== technical_id) {
      throw new AppError(
        "Only the technician responsible for the call can close it",
        403,
      );
    }

    if (call.status === StatusCall.open) {
      throw new AppError("The call must be started to be closed", 400);
    }

    if (call.status === StatusCall.closed) {
      throw new AppError("This call is already closed", 400);
    }

    const updateCallStatus = await prismaDataBase.call.update({
      where: { id },
      data: {
        status: StatusCall.closed,
      },
    });

    return response.status(200).json({
      message: "Call closed",
      call: updateCallStatus,
    });
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
