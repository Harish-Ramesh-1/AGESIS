import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PORTALS, PORTAL_IDS } from '../../../constants/roles'
import { isValidEmail, validatePortalId } from '../utils/validators'
import { generateOtp, verifyOtp } from '../services/auth.service'
import { useAuthStore } from '../../../store/authStore'

const STEP = {
  FORM: 'form',
  OTP: 'otp',
  SUCCESS: 'success',
}

const REDIRECT_DELAY_MS = 900

const PORTAL_DASHBOARD_PATH = {
  [PORTAL_IDS.PARENT]: '/parent/dashboard',
  [PORTAL_IDS.ACCOUNTANT]: '/accountant/dashboard',
  [PORTAL_IDS.ADMIN]: '/admin/dashboard',
}

export default function usePortalAuth() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const redirectTimeoutRef = useRef(null)

  const [selectedPortalId, setSelectedPortalId] = useState(PORTAL_IDS.PARENT)
  const [step, setStep] = useState(STEP.FORM)
  const [idValue, setIdValue] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedPortal = PORTALS.find((portal) => portal.id === selectedPortalId)

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) window.clearTimeout(redirectTimeoutRef.current)
    }
  }, [])

  function selectPortal(portalId) {
    setSelectedPortalId(portalId)
    setIdValue('')
    setEmail('')
    setErrors({})
    setFormError('')
  }

  function validateForm() {
    const nextErrors = {}
    if (!validatePortalId(selectedPortal, idValue)) {
      nextErrors.idValue = selectedPortal.idHelperText
    }
    if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function submitContinue(event) {
    event.preventDefault()
    setFormError('')
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await generateOtp({ portal: selectedPortalId, idValue, email })
      setStep(STEP.OTP)
    } catch (error) {
      setFormError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function submitOtp(otp) {
    setOtpError('')
    setIsSubmitting(true)
    try {
      const result = await verifyOtp({ portal: selectedPortalId, idValue, email, otp })
      setStep(STEP.SUCCESS)
      login({
        portal: selectedPortalId,
        user: result?.user,
        accessToken: result?.accessToken,
        refreshToken: result?.refreshToken,
      })
      const dashboardPath = PORTAL_DASHBOARD_PATH[selectedPortalId]
      if (dashboardPath) {
        redirectTimeoutRef.current = window.setTimeout(() => {
          navigate(dashboardPath, { replace: true })
        }, REDIRECT_DELAY_MS)
      }
    } catch (error) {
      setOtpError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function resendOtp() {
    setOtpError('')
    try {
      await generateOtp({ portal: selectedPortalId, idValue, email })
    } catch (error) {
      setOtpError(error.message)
    }
  }

  function goBackToForm() {
    setStep(STEP.FORM)
    setOtpError('')
  }

  return {
    step,
    selectedPortal,
    selectedPortalId,
    idValue,
    setIdValue,
    email,
    setEmail,
    errors,
    formError,
    otpError,
    isSubmitting,
    selectPortal,
    submitContinue,
    submitOtp,
    resendOtp,
    goBackToForm,
  }
}
