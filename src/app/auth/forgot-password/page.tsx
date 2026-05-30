import { ForgotPasswordForm } from '@/components/forgot-password-form'

type ForgotPasswordPageProps = {
  searchParams?: Promise<{
    next?: string
  }>
}

export default async function Page({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm next={params?.next} />
      </div>
    </div>
  )
}
