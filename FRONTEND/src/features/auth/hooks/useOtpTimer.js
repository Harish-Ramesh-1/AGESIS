import { useEffect, useState } from 'react'

const DEFAULT_DURATION = 90

export default function useOtpTimer(duration = DEFAULT_DURATION) {
  const [secondsLeft, setSecondsLeft] = useState(duration)

  useEffect(() => {
    if (secondsLeft <= 0) return undefined
    const timerId = window.setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000)
    return () => window.clearTimeout(timerId)
  }, [secondsLeft])

  function reset() {
    setSecondsLeft(duration)
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')

  return {
    secondsLeft,
    isExpired: secondsLeft === 0,
    label: `${minutes}:${seconds}`,
    reset,
  }
}
