import { Mail, Sparkles } from 'lucide-react'
import InputField from '../../../components/common/Input/InputField'
import { PrimaryButton } from '../../../components/common/Button'
import Alert from '../../../components/feedback/Alert/Alert'
import { IS_DEMO_AUTH } from '../../../constants/api'

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
  function fillDemoCredentials() {
    onIdChange(portal.demoCredentials.idValue)
    onEmailChange(portal.demoCredentials.email)
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit} noValidate>
      {IS_DEMO_AUTH && (
        <Alert variant="info">
          <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span>
              Demo mode: use{' '}
              <span className="font-semibold">{portal.demoCredentials.idValue}</span> with{' '}
              <span className="font-semibold">{portal.demoCredentials.email}</span>.
            </span>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="inline-flex items-center gap-1 font-semibold text-brand-600 underline-offset-2 hover:underline dark:text-brand-300"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Autofill
            </button>
          </span>
        </Alert>
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
