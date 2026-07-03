import { PrismaClient } from "../generated/prisma/client.js";
//import { PrismaClient } from "@prisma/client";
/* Eu estava tentando acessar o banco de dados importando por "@prisma/client" mas estava dando errado, só deu certo quando importei "../generated/prisma/client.js". Por que a primeira opção deu errado e a segunda não?*/

const prismaDataBase = new PrismaClient({
  log: process.env.NODE_ENV === "production" ? [] : ["query"],
});

export { prismaDataBase };
