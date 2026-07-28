import { Mail, Sparkles } from 'lucide-react'
import InputField from '../../../components/common/Input/InputField'
import { PrimaryButton } from '../../../components/common/Button'
import Alert from '../../../components/feedback/Alert/Alert'
import { SHOW_LOGIN_HINTS } from '../../../constants/api'

export default function PortalLoginForm({
  portal,
  idValue,
  onIdChange,
  email,
  onEmailChange,
  errors,
  formError,
  isSubmitting,
  onSubmit,
}) {
  function fillCredentials(credentials) {
    onIdChange(credentials.idValue)
    onEmailChange(credentials.email)
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit} noValidate>
      {SHOW_LOGIN_HINTS && (
        <>
          <Alert variant="info">
            <div className="flex flex-col gap-1.5">
              <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                <span>
                  Judge access: use{' '}
                  <span className="font-semibold">{portal.demoCredentials.idValue}</span> with{' '}
                  <span className="font-semibold">{portal.demoCredentials.email}</span>
                  {portal.demoCredentials.note ? ` (${portal.demoCredentials.note})` : ''} — a real OTP is
                  emailed there.
                </span>
                <button
                  type="button"
                  onClick={() => fillCredentials(portal.demoCredentials)}
                  className="inline-flex items-center gap-1 font-semibold text-brand-600 underline-offset-2 hover:underline dark:text-brand-300"
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Autofill
                </button>
              </span>

              {portal.demoCredentialsAlt && (
                <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                  <span>
                    Or <span className="font-semibold">{portal.demoCredentialsAlt.idValue}</span>
                    {portal.demoCredentialsAlt.note ? ` (${portal.demoCredentialsAlt.note})` : ''} — same
                    inbox.
                  </span>
                  <button
                    type="button"
                    onClick={() => fillCredentials(portal.demoCredentialsAlt)}
                    className="inline-flex items-center gap-1 font-semibold text-brand-600 underline-offset-2 hover:underline dark:text-brand-300"
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    Autofill
                  </button>
                </span>
              )}
            </div>
          </Alert>

          <Alert variant="info">
            <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <span>
                Just trying it out? Use{' '}
                <span className="font-semibold">{portal.sampleCredentials.idValue}</span> with{' '}
                <span className="font-semibold">{portal.sampleCredentials.email}</span> and the
                fallback code on the next step.
              </span>
              <button
                type="button"
                onClick={() => fillCredentials(portal.sampleCredentials)}
                className="inline-flex items-center gap-1 font-semibold text-brand-600 underline-offset-2 hover:underline dark:text-brand-300"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Autofill
              </button>
            </span>
          </Alert>
        </>
      )}

      <InputField
        label={portal.idLabel}
        placeholder={portal.idPlaceholder}
        value={idValue}
        onChange={(event) => onIdChange(event.target.value)}
        error={errors.idValue}
        helperText={!errors.idValue ? portal.idHelperText : undefined}
        autoComplete="off"
        required
      />
      <InputField
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        icon={Mail}
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        error={errors.email}
        autoComplete="email"
        required
      />

      {formError && <Alert variant="error">{formError}</Alert>}

      <PrimaryButton type="submit" isLoading={isSubmitting}>
        Continue
      </PrimaryButton>
    </form>
  )
}
