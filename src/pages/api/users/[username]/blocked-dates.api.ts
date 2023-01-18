import dayjs from "dayjs";
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
        time_end_in_minutes: true,
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

    const blockedDatesRaw: Array<{ date: number }> = await prisma.$queryRaw`
      SELECT
        EXTRACT(DAY FROM S.DATE) AS date,
        COUNT(S.date) AS amount,
        ((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60) AS size
      FROM schedulings S
      LEFT JOIN user_time_intervals UTI
        ON UTI.week_day = WEEKDAY(DATE_ADD(S.date, INTERVAL 1 DAY))
      WHERE S.user_id = ${user.id}
        AND DATE_FORMAT(S.date, "%Y-%m") = ${`${year}-${month}`}
      GROUP BY EXTRACT(DAY FROM S.DATE),
        ((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60)
      HAVING amount >= size
    `;

    const blockedDates = blockedDatesRaw.map((item) => item.date);
    const today = dayjs();

    const todayWeekDay = availableWeekDays.find(
      (availableWeekDay) => availableWeekDay.week_day === today.day()
    );
    const endHour = todayWeekDay
      ? Math.floor(todayWeekDay.time_end_in_minutes / 60)
      : 0;
    const noAvailableHoursToday = todayWeekDay
      ? today.endOf("day").hour() >= endHour
      : false;
    if (noAvailableHoursToday) {
      blockedDates.push(today.get("date"));
    }

    return res.json({ blockedWeekDays, blockedDates });
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
