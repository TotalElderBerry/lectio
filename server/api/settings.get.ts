export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  return await getOrCreateSettings(userId)
})
