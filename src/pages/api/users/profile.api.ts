import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { buildNextAuthOptions } from "../auth/[...nextauth].api";

const bodyParser = z.object({
  bio: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") return res.status(405).end();

  const session = await unstable_getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res)
  );

  if (!session) {
    res.status(401).json({ message: "You must be logged in." });
    return;
  }

  try {
    const { bio } = bodyParser.parse(req.body);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        bio,
      },
    });

    return res.status(204).end();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Erro ao validar os dados",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        message: "Erro interno do servidor",
        errors: [],
      });
    }
  }
}
