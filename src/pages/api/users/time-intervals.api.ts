import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { buildNextAuthOptions } from "../auth/[...nextauth].api";

const bodyParser = z.object({
  intervals: z.array(
    z.object({
      weekDay: z.number().min(0).max(6),
      startTimeInMinutes: z
        .number()
        .min(60)
        .max(24 * 60),
      endTimeInMinutes: z
        .number()
        .min(60)
        .max(24 * 60),
    })
  ),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

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
    const { intervals } = bodyParser.parse(req.body);

    const response = await Promise.all(
      intervals.map((interval) => {
        return prisma.userTimeInterval.create({
          data: {
            week_day: interval.weekDay,
            time_end_in_minutes: interval.endTimeInMinutes,
            time_start_in_minutes: interval.startTimeInMinutes,
            user_id: session.user.id,
          },
        });
      })
    );

    return res.status(201).json(response);
  } catch (error) {
    console.log(error);
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
