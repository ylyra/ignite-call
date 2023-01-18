import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { buildNextAuthOptions } from "../../auth/[...nextauth].api";

const paramsParser = z.object({
  username: z.string(),
  date: z.string(),
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
    const { username, date } = paramsParser.parse(req.query);

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User does not exists." });
    }

    const referenceDate = dayjs(date);
    const isPastDate = referenceDate.endOf("day").isBefore(new Date());

    if (isPastDate) {
      return res.json({ availableTimes: [], possibleTimes: [] });
    }

    const userAvailability = await prisma.userTimeInterval.findFirst({
      where: {
        user_id: user.id,
        week_day: referenceDate.get("day"),
      },
    });

    if (!userAvailability) {
      return res.json({ availableTimes: [], possibleTimes: [] });
    }

    const { time_end_in_minutes, time_start_in_minutes } = userAvailability;

    const startHour = Math.floor(time_start_in_minutes / 60);
    const endHour = Math.floor(time_end_in_minutes / 60);

    const possibleTimes = Array.from({
      length: endHour - startHour,
    }).map((_, i) => {
      return startHour + i;
    });

    const blockedTimes = await prisma.scheduling.findMany({
      select: {
        date: true,
      },
      where: {
        user_id: user.id,
        date: {
          gte: referenceDate.set("hour", startHour).toDate(),
          lte: referenceDate.set("hour", endHour).toDate(),
        },
      },
    });

    const availableTimes = possibleTimes.filter((possibleTime) => {
      const isTimeBlocked = blockedTimes.some(
        (blockedTime) => blockedTime.date.getHours() === possibleTime
      );

      const isTimeInPast = referenceDate
        .set("hour", possibleTime)
        .isBefore(new Date());

      return !isTimeBlocked && !isTimeInPast;
    });

    return res.json({ availableTimes, possibleTimes, blockedTimes });
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
