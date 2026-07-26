import { useState } from 'react'
import { ArrowLeft, Sparkles } from 'lucide-react'
import OTPInput from './OTPInput'
import { PrimaryButton, GlassButton } from '../../../components/common/Button'
import Alert from '../../../components/feedback/Alert/Alert'
import useOtpTimer from '../hooks/useOtpTimer'
import { IS_DEMO_AUTH } from '../../../constants/api'
import { DEMO_OTP } from '../../../constants/roles'

export default function OtpStep({ portal, email, otpError, isSubmitting, onVerify, onResend, onBack }) {
  const [otp, setOtp] = useState('')
  const { label, isExpired, reset } = useOtpTimer(90)

  function handleVerify(event) {
    event.preventDefault()
    onVerify(otp)
  }

  function handleResend() {
    reset()
    setOtp('')
    onResend()
  }

  return (
    <form className="flex flex-col gap-3.5" onSubmit={handleVerify} noValidate>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
          {portal.title}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Enter the 6-digit code sent to
        </p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{email}</p>
      </div>

      <OTPInput value={otp} onChange={setOtp} disabled={isSubmitting} />

      {IS_DEMO_AUTH && (
        <Alert variant="info">
          <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span>
              Demo mode: the code is <span className="font-semibold">{DEMO_OTP}</span>.
            </span>
            <button
              type="button"
              onClick={() => setOtp(DEMO_OTP)}
              className="inline-flex items-center gap-1 font-semibold text-brand-600 underline-offset-2 hover:underline dark:text-brand-300"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Autofill
            </button>
          </span>
        </Alert>
      )}

      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500 dark:text-slate-400">
          {isExpired ? 'Code expired' : `Expires in ${label}`}
        </span>
        <button
          type="button"
          onClick={handleResend}
          disabled={!isExpired}
          className="font-semibold text-brand-600 transition-colors duration-200 hover:text-brand-700 disabled:cursor-not-allowed disabled:text-slate-300 dark:text-brand-300 dark:disabled:text-slate-600"
        >
          Resend OTP
        </button>
      </div>

      {otpError && <Alert variant="error">{otpError}</Alert>}

      <div className="flex gap-3">
        <GlassButton icon={ArrowLeft} onClick={onBack} className="flex-1">
          Back
        </GlassButton>
        <PrimaryButton
          type="submit"
          isLoading={isSubmitting}
          disabled={otp.length !== 6}
          fullWidth={false}
          className="flex-[2]"
        >
          Verify OTP
        </PrimaryButton>
      </div>
    </form>
  )
}
