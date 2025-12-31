'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'

type FormData = {
  email: string
  password: string
  passwordConfirm: string
}

export const CreateAccountForm: React.FC = () => {
  const t = useTranslations('auth.createAccount')
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')

  const onSubmit = useCallback(
    async (data: FormData) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users`, {
        body: JSON.stringify(data),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const message = response.statusText || t('error')
        setError(message)
        return
      }

      const redirect = searchParams.get('redirect')

      const timer = setTimeout(() => {
        setLoading(true)
      }, 1000)

      try {
        await login(data)
        clearTimeout(timer)
        if (redirect) router.push(redirect)
        else router.push(`/account?success=${encodeURIComponent('Account created successfully')}`)
      } catch (_) {
        clearTimeout(timer)
        setError(t('credentialsError'))
      }
    },
    [login, router, searchParams, t],
  )

  return (
    <form className="max-w-lg py-4" onSubmit={handleSubmit(onSubmit)}>
      <Message error={error} />

      <div className="flex flex-col gap-8 mb-8">
        <FormItem>
          <Label htmlFor="email" className="mb-2">
            {t('emailAddress')}
          </Label>
          <Input
            id="email"
            {...register('email', { required: t('validation.emailRequired') })}
            type="email"
          />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="password" className="mb-2">
            {t('newPassword')}
          </Label>
          <Input
            id="password"
            {...register('password', { required: t('validation.passwordRequired') })}
            type="password"
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="passwordConfirm" className="mb-2">
            {t('confirmPassword')}
          </Label>
          <Input
            id="passwordConfirm"
            {...register('passwordConfirm', {
              required: t('validation.confirmPasswordRequired'),
              validate: (value) => value === password.current || t('validation.passwordsMismatch'),
            })}
            type="password"
          />
          {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
        </FormItem>
      </div>
      <Button disabled={loading} type="submit" variant="default">
        {loading ? t('processing') : t('createAccount')}
      </Button>

      <div className="prose dark:prose-invert mt-8">
        <p>
          {t('alreadyHaveAccount')} <Link href={`/login${allParams}`}>{t('login')}</Link>
        </p>
      </div>
    </form>
  )
}
