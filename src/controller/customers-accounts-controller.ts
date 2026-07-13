import { Request, Response } from "express";
import z from "zod";
import { prismaDataBase } from "../database/prismaDataBase";
import { hash } from "bcrypt";

class AccountCustomerController {
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

  async index(request: Request, response: Response) {
    const allCustomers = await prismaDataBase.customer.findMany();

    return response.status(200).json(allCustomers);
  }

  async patch(request: Request, response: Response) {
    const bodySchema = z.object({
      email: z.email().trim(),
      password: z.string().trim().min(6),
    });

    const paramSchema = z.object({
      id: z.uuid(),
    });

    const { email, password } = bodySchema.parse(request.body);
    const { id } = paramSchema.parse(request.params);

    const hashedPassword = await hash(password, 8);

    const editedAccount = await prismaDataBase.customer.update({
      data: {
        email: email,
        password: hashedPassword,
      },
      where: { id },
    });

    const editedAccountWithoutPassword = editedAccount;

    const { password: _, ...accountUpdated } = editedAccountWithoutPassword;

    return response.status(200).json({ accountUpdated });
  }

  async delete(request: Request, response: Response) {
    const paramSchema = z.object({
      id: z.uuid(),
    });

    const { id } = paramSchema.parse(request.params);

    await prismaDataBase.customer.delete({
      where: { id },
    });

    return response.status(200).json({ message: "Customer Account Deleted" });
  }
}

export { AccountCustomerController };
