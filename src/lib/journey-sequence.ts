// The StayStory sequence and the rule for what comes next.
//
// No server-only imports here, on purpose — same reasoning as
// compass-fields.ts. It keeps this importable from a client component later,
// and it makes decideNextStep testable without a database.

export type StepId = 'audit' | 'compass' | 'blueprint' | 'generator' | 'story' | 'playbook'

export type StepStatus =
  | 'not_started'
  | 'in_progress'
  | 'ready_to_review'
  | 'confirmed'
  | 'completed'

/** Label text, so status is never communicated by colour alone. */
export const STATUS_LABEL: Record<StepStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  ready_to_review: 'Ready to review',
  confirmed: 'Confirmed',
  completed: 'Completed',
}

export type NextStep = {
  stepId: StepId
  title: string
  /** Why this step follows from the work already done. Never omitted. */
  why: string
  ctaLabel: string
  href: string
}

/** Everything the decision depends on, all of it read from stored state. */
export type JourneyProgress = {
  auditCount: number
  pendingCount: number
  compassFilled: number
  compassConfirmed: boolean
  blueprintTouchpoints: number
  suggestionCount: number
  storyCount: number
  playbookCount: number
}

/**
 * Walk the sequence and stop at the first thing that isn't done. Every
 * recommendation carries the reason it follows from the step before it —
 * the dashboard's job is to teach the connection, not to route traffic.
 *
 * Worth knowing about the confirm step: buildCompassContext returns null
 * until a Compass has been confirmed at least once, so an unconfirmed
 * Compass genuinely does not reach the Generator or the Playbook. That's why
 * confirming is treated as a real step rather than a formality.
 */
export function decideNextStep(s: JourneyProgress): NextStep {
  if (s.auditCount === 0) {
    return {
      stepId: 'audit',
      title: 'Start with your Experience Audit',
      why: 'Begin with the experience you already have. The Audit is how StayStory learns what is working, where friction sits, and what your guests are most likely feeling.',
      ctaLabel: 'Run your Audit',
      href: '/audit',
    }
  }

  if (s.pendingCount > 0) {
    const n = s.pendingCount
    return {
      stepId: 'compass',
      title: `Review ${n} Compass ${n === 1 ? 'insight' : 'insights'} from your work`,
      why: 'Your Audit and the other tools have proposed things they noticed about your hospitality. Nothing is added to your Compass until you accept it, so these are waiting on you.',
      ctaLabel: 'Review and decide',
      href: '/compass',
    }
  }

  if (s.compassFilled === 0) {
    return {
      stepId: 'compass',
      title: 'Shape your Experience Compass',
      why: 'You have looked at the experience you have. Now decide the one you want — what guests should feel, remember and tell someone about afterwards.',
      ctaLabel: 'Open your Compass',
      href: '/compass',
    }
  }

  if (!s.compassConfirmed) {
    return {
      stepId: 'compass',
      title: 'Confirm your Experience Compass',
      why: 'Your Compass is taking shape. Confirming it is what lets the Generator and your Playbook work from it — until then they are designing without your direction.',
      ctaLabel: 'Review and confirm',
      href: '/compass',
    }
  }

  if (s.blueprintTouchpoints === 0) {
    return {
      stepId: 'blueprint',
      title: 'Map your guest journey in the Experience Blueprint',
      why: 'Your Compass says what the stay should feel like. The Blueprint is where you decide which moments across the journey carry that feeling.',
      ctaLabel: 'Open your Blueprint',
      href: '/journey',
    }
  }

  if (s.suggestionCount === 0) {
    return {
      stepId: 'generator',
      title: 'Create ideas for the moments you have mapped',
      why: 'You know which moments matter. The Generator turns them into specific details and gestures, guided by the Compass you confirmed.',
      ctaLabel: 'Open the Generator',
      href: '/generator',
    }
  }

  if (s.storyCount === 0) {
    return {
      stepId: 'story',
      title: 'Put the experience into words',
      why: 'You have designed the moments. Story Builder turns them into the language guests read before they arrive and repeat after they leave.',
      ctaLabel: 'Open Story Builder',
      href: '/story',
    }
  }

  if (s.playbookCount === 0) {
    return {
      stepId: 'playbook',
      title: 'Bring your work together in your Guest Journey Playbook',
      why: 'You have looked, decided, mapped, created and written. The Playbook is where it becomes something you can actually host from, every stay.',
      ctaLabel: 'Build your Playbook',
      href: '/legend',
    }
  }

  return {
    stepId: 'compass',
    title: 'Keep the experience evolving',
    why: 'You have been through the whole sequence. From here the work is noticing what guests actually respond to and letting your Compass change with it.',
    ctaLabel: 'Revisit your Compass',
    href: '/compass',
  }
}
