import confetti from 'canvas-confetti'

const CONFETTI_COLORS = ['#F5E0AE', '#A6C2D2', '#D9BFB1', '#B8D2C7']

// Celebration animation for completing a task.
export function celebrateCompletedTask() {
  const fire = (options) =>
    confetti({
      origin: { y: 0.65 },
      colors: CONFETTI_COLORS,
      disableForReducedMotion: true,
      ...options,
    })

  fire({ particleCount: 60, spread: 55, angle: 60, origin: { x: 0.75, y: 0.65 } })
  fire({ particleCount: 60, spread: 55, angle: 120, origin: { x: 0.75, y: 0.65 } })
}
