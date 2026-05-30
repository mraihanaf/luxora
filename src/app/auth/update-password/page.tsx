import { UpdatePasswordForm } from '@/components/update-password-form'

type UpdatePasswordPageProps = {
  searchParams?: Promise<{
    next?: string
  }>
}

export default async function Page({ searchParams }: UpdatePasswordPageProps) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdatePasswordForm next={params?.next} />
      </div>
    </div>
  )
}
