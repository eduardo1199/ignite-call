import z from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('Invalid environment variable', _env.error.format())

  throw new Error('Invalid environment variable')
}

export const env = _env.data
