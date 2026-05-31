import { SignUpForm } from '@/components/sign-up-form'

type SignUpPageProps = {
  searchParams?: Promise<{
    next?: string
  }>
}

export default async function Page({ searchParams }: SignUpPageProps) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm next={window.location.origin} />
      </div>
    </div>
  )
}
