export const STEPS = ['read', 'reflect', 'respond', 'rest'] as const
export type Step = (typeof STEPS)[number]

export interface StepDefinition {
  key: Step
  title: string
  /** The rung's name on Guigo's ladder. */
  latin: string
  /** How to approach the passage this time. */
  instruction: string
  /** The question to sit with. */
  prompt: string
  placeholder: string
  defaultSeconds: number
}

export const STEP_DEFINITIONS: Record<Step, StepDefinition> = {
  read: {
    key: 'read',
    latin: 'Lectio',
    title: 'Read',
    instruction: 'Slowly and thoughtfully, read the Scripture passage the first time.',
    prompt: 'What word or phrase captures your attention and grabs your heart? Linger with it whenever this happens.',
    placeholder: 'Whatever you noticed…',
    defaultSeconds: 180,
  },
  reflect: {
    key: 'reflect',
    latin: 'Meditatio',
    title: 'Reflect',
    instruction: 'Slowly and prayerfully, read the passage again.',
    prompt: 'What is God saying to you in this passage? Offering you? Asking you? What feelings are arising within you?',
    placeholder: 'What is stirring…',
    defaultSeconds: 240,
  },
  respond: {
    key: 'respond',
    latin: 'Oratio',
    title: 'Respond',
    instruction: 'Slowly and prayerfully, read the passage again.',
    prompt: 'Respond to God from your heart. Speak to God of your feelings and insights. Offer these to God.',
    placeholder: 'Speak to God here…',
    defaultSeconds: 240,
  },
  rest: {
    key: 'rest',
    latin: 'Contemplatio',
    title: 'Rest',
    instruction: 'Possibly read the passage another time.',
    prompt: 'Sit quietly in God’s presence, asking, “What are you saying to me?” Rest in God’s love, and listen.',
    placeholder: 'Only if you wish to write anything…',
    defaultSeconds: 300,
  },
}

export const STEP_LIST: StepDefinition[] = STEPS.map(step => STEP_DEFINITIONS[step])
