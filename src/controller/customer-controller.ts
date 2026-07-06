import { Request, Response } from "express";
import z from "zod";
import { prismaDataBase } from "../database/prismaDataBase";
import { hash } from "bcrypt";

class CustomerController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(3),
      email: z.email().trim(),
      password: z.string().trim().min(6),
    });

    const { name, email, password } = bodySchema.parse(request.body);

    const hashedPassword = await hash(password, 8);

    const customer = await prismaDataBase.customer.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    const { password: _, ...customerWithoutPassword } = customer;

    return response.status(200).json({ customer: customerWithoutPassword });
  }
}

export { CustomerController };
