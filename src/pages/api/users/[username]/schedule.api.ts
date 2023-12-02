import dayjs from 'dayjs'
import { prisma } from 'lib/prisma'
import { z } from 'zod'
import { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis'
import { getGoogleOAuthToken } from 'lib/google'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }
  const username = String(req.query.username)

  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user) {
    return res.status(400).json({ message: 'user does not exist.' })
  }

  const createSchedulingBody = z.object({
    name: z.string(),
    email: z.string().email(),
    observation: z.string(),
    date: z.string().datetime(),
  })

  const { name, email, observation, date } = createSchedulingBody.parse(
    req.body,
  )

  const schedulingDate = dayjs(date).startOf('hour')

  if (schedulingDate.isBefore(new Date())) {
    return res.status(400).json({ message: 'Date is the past' })
  }

  const conflictingScheduling = await prisma.scheduling.findFirst({
    where: {
      user_id: user.id,
      date: schedulingDate.toDate(),
    },
  })

  if (conflictingScheduling) {
    return res
      .status(400)
      .json({ message: 'There is another at the same time' })
  }

  const schedulingCreated = await prisma.scheduling.create({
    data: {
      name,
      email,
      date: schedulingDate.toDate(),
      user_id: user.id,
      observation,
    },
  })

  const calendar = google.calendar({
    version: 'v3',
    auth: await getGoogleOAuthToken(user.id),
  })

  // create event from google
  await calendar.events.insert({
    calendarId: 'primary', // default calendar
    conferenceDataVersion: 1, // habilitar o conferenceData
    requestBody: {
      summary: `Ignite Call: ${name}`, // titulo do evento
      description: observation, // observações do evento ou descrição
      start: {
        dateTime: schedulingDate.format(), // horário de inicio
      },
      end: {
        dateTime: schedulingDate.add(1, 'hour').format(), // hora´rio da duração do evento
      },
      attendees: [
        // membros que irão participar do evento
        {
          email,
          displayName: name,
        },
      ],
      conferenceData: {
        // dados do evento do google meet
        createRequest: {
          requestId: schedulingCreated.id,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    },
  })

  return res.status(201).end()
}
