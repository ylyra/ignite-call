import dayjs from "dayjs";
import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { z } from "zod";
import { getGoogleOAuthToken } from "../../../../lib/google";
import { prisma } from "../../../../lib/prisma";
import { buildNextAuthOptions } from "../../auth/[...nextauth].api";

const paramsParser = z.object({
  username: z.string(),
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
    res.status(401).json({ message: "You must be logged in.", errors: [] });
    return;
  }

  try {
    const { username } = paramsParser.parse(req.query);

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User does not exists.", errors: [] });
    }

    const createSchedulingBody = z.object({
      name: z.string(),
      email: z.string().email(),
      notes: z.string(),
      date: z.string().datetime(),
    });

    const { name, email, notes, date } = createSchedulingBody.parse(req.body);
    const schedulingDate = dayjs(date).startOf("hour");

    if (schedulingDate.isBefore(new Date())) {
      return res.status(400).json({
        message: "You cannot schedule a meeting in the past.",
        errors: [],
      });
    }

    const conflictScheduling = await prisma.scheduling.findFirst({
      where: {
        user_id: user.id,
        date: schedulingDate.toDate(),
      },
    });

    if (conflictScheduling) {
      return res.status(400).json({
        message: "This date is already scheduled.",
        errors: [],
      });
    }

    const scheduling = await prisma.scheduling.create({
      data: {
        name,
        email,
        user_id: user.id,
        notes,
        date: schedulingDate.toDate(),
      },
    });

    const calendar = google.calendar({
      version: "v3",
      auth: await getGoogleOAuthToken(user.id),
    });

    await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: {
        summary: `Ignite Call: talk with ${name}`,
        description: notes,
        start: {
          dateTime: schedulingDate.format(),
        },
        end: {
          dateTime: schedulingDate.add(1, "hour").format(),
        },
        attendees: [
          {
            email,
            displayName: name,
          },
        ],
        conferenceData: {
          createRequest: {
            requestId: scheduling.id,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      },
    });

    return res.status(201).end();
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
