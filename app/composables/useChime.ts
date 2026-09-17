let context: AudioContext | undefined

/**
 * A soft struck-bowl tone rather than an alarm: two sine partials with a long
 * fade. Synthesised so there is no audio file to load, and nothing to fail
 * silently on a slow connection.
 */
export function useChime() {
  function ring(frequency = 396) {
    if (!import.meta.client) return

    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return

      context ??= new Ctor()
      if (context.state === 'suspended') void context.resume()

      const now = context.currentTime

      for (const [partial, peak] of [[1, 0.13], [2.01, 0.05], [3.02, 0.02]] as const) {
        const osc = context.createOscillator()
        const gain = context.createGain()

        osc.type = 'sine'
        osc.frequency.value = frequency * partial

        // exponentialRamp can't reach 0, hence the near-silent floor.
        gain.gain.setValueAtTime(0.0001, now)
        gain.gain.exponentialRampToValueAtTime(peak, now + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.6)

        osc.connect(gain)
        gain.connect(context.destination)
        osc.start(now)
        osc.stop(now + 3.8)
      }
    }
    catch {
      // Sound is a nicety. Never let it interrupt the prayer.
    }
  }

  return { ring }
}
