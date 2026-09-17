import type { H3Event } from 'h3'
import type { ZodType } from 'zod'

function fail(message: string): never {
  throw createError({ statusCode: 400, statusMessage: message })
}

/** Reads and validates a JSON body, surfacing the first issue as a plain message. */
export async function readBodyAs<T>(event: H3Event, schema: ZodType<T>): Promise<T> {
  const result = schema.safeParse(await readBody(event))
  if (!result.success) fail(result.error.issues[0]?.message ?? 'That request was not valid.')
  return result.data
}

/** Reads and validates the query string. */
export async function readQueryAs<T>(event: H3Event, schema: ZodType<T>): Promise<T> {
  const result = schema.safeParse(getQuery(event))
  if (!result.success) fail(result.error.issues[0]?.message ?? 'That request was not valid.')
  return result.data
}
