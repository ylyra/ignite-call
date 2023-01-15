import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { buildNextAuthOptions } from "../../auth/[...nextauth].api";

const paramsParser = z.object({
  username: z.string(),
  year: z.string(),
  month: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end();

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
    const { username, month, year } = paramsParser.parse(req.query);

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User does not exists." });
    }

    const availableWeekDays = await prisma.userTimeInterval.findMany({
      select: {
        week_day: true,
      },
      where: {
        user_id: user.id,
      },
    });

    const blockedWeekDays = [0, 1, 2, 3, 4, 5, 6].filter((weekDay) => {
      return !availableWeekDays.some(
        (availableWeekDay) => availableWeekDay.week_day === weekDay
      );
    });

    return res.json({
      blockedWeekDays,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Erro ao validar os dados",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        message: "Erro interno do servidor",
        error,
      });
    }
  }
}
