import { NextApiRequest, NextApiResponse } from 'next'
import { setCookie } from 'nookies'
import { z } from 'zod'

import { prisma } from '../../../lib/prisma'

const bodyParser = z.object({
  username: z
    .string()
    .min(3, 'O usuário deve ter pelo menos 3 caracteres')
    .regex(/^([a-z\\-]+)$/i, 'O usuário deve conter apenas letras e hifens')
    .transform((username) => username.toLowerCase()),
  fullName: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { fullName, username } = bodyParser.parse(req.body)

    const userExists = await prisma.user.findUnique({
      where: {
        username,
      },
    })

    if (userExists) {
      return res.status(400).json({
        message: 'Já existe um usuário com esse nome',
      })
    }

    const user = await prisma.user.create({
      data: {
        name: fullName,
        username,
      },
    })

    setCookie(
      {
        res,
      },
      '@ignitecall:userId',
      user.id,
      {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      },
    )

    return res.status(201).json(user)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Erro ao validar os dados',
        errors: error.errors,
      })
    } else {
      res.status(500).json({
        message: 'Erro interno do servidor',
        error,
      })
    }
  }
}
