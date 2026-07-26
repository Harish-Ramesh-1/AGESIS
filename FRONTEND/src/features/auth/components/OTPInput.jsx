import { useEffect, useRef } from 'react'

const OTP_LENGTH = 6

export default function OTPInput({ value, onChange, disabled }) {
  const inputRefs = useRef([])
  const digits = value
    .split('')
    .concat(Array(OTP_LENGTH).fill(''))
    .slice(0, OTP_LENGTH)

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  function updateDigit(index, digit) {
    const nextDigits = [...digits]
    nextDigits[index] = digit
    onChange(nextDigits.join(''))
  }

  function handleChange(event, index) {
    const raw = event.target.value.replace(/\D/g, '')
    if (!raw) {
      updateDigit(index, '')
      return
    }
    const digit = raw.slice(-1)
    updateDigit(index, digit)
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(event, index) {
    if (event.key === 'Backspace') {
      if (digits[index]) {
        updateDigit(index, '')
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        updateDigit(index - 1, '')
      }
      return
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(event) {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    onChange(pasted)
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="One-time passcode">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputRefs.current[index] = node
          }}
          value={digit}
          onChange={(event) => handleChange(event, index)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          onPaste={handlePaste}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
          className="h-10 w-9 rounded-xl border border-slate-200 bg-white/80 text-center text-base font-semibold text-slate-900 shadow-clay-inset transition-colors duration-200 focus:border-brand-500 focus:outline-none disabled:opacity-50 dark:border-white/10 dark:bg-slate-900/60 dark:text-white sm:w-10"
        />
      ))}
    </div>
  )
}
