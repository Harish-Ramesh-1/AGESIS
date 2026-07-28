import { CheckCircle2 } from 'lucide-react'
import ThemeToggle from '../../../components/layout/ThemeToggle/ThemeToggle'
import Footer from '../../../components/layout/Footer/Footer'
import BrandPanel from '../components/BrandPanel'
import LoginCard from '../components/LoginCard'
import PortalSelector from '../components/PortalSelector'
import PortalLoginForm from '../components/PortalLoginForm'
import usePortalAuth from '../hooks/usePortalAuth'

export default function LoginPage() {
  const auth = usePortalAuth()

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-100 dark:bg-slate-950">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-400/25 blur-[110px] dark:bg-brand-500/20" />
        <div className="absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-emerald-300/20 blur-[110px] dark:bg-emerald-500/10" />
        <div className="absolute -right-24 top-1/3 h-[24rem] w-[24rem] rounded-full bg-violet-300/25 blur-[110px] dark:bg-violet-500/15" />
      </div>

      <div className="absolute right-5 top-5 z-10 sm:right-8 sm:top-8">
        <ThemeToggle />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col lg:flex-row">
        <div className="lg:w-[42%] xl:w-2/5">
          <BrandPanel />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-6 sm:px-10">
          <LoginCard title="Welcome Back" subtitle="Choose your portal to continue">
            {auth.step === 'form' && (
              <div className="flex flex-col gap-4">
                <PortalSelector selectedPortalId={auth.selectedPortalId} onSelect={auth.selectPortal} />
                <PortalLoginForm
                  portal={auth.selectedPortal}
                  idValue={auth.idValue}
                  onIdChange={auth.setIdValue}
                  email={auth.email}
                  onEmailChange={auth.setEmail}
                  password={auth.password}
                  onPasswordChange={auth.setPassword}
                  errors={auth.errors}
                  formError={auth.formError}
                  isSubmitting={auth.isSubmitting}
                  onSubmit={auth.submitContinue}
                />
              </div>
            )}

            {auth.step === 'success' && (
              <div className="flex flex-col items-center gap-2 py-3 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Login successful
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Redirecting you to your {auth.selectedPortal.title.replace(' Portal', '')} dashboard...
                </p>
              </div>
            )}
          </LoginCard>
        </div>
      </div>

      <Footer
        text="Powered by AGESIS"
        version="1.0"
        copyright={`© ${new Date().getFullYear()} Agesis International School`}
      />
    </div>
  )
}
