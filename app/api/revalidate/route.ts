import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (!process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json(
      { message: 'SANITY_REVALIDATE_SECRET is not configured' },
      { status: 501 },
    )
  }

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`, 'layout')
    revalidatePath(`/${locale}/work`)
    revalidatePath(`/${locale}/contact`)
  }

  return NextResponse.json({ revalidated: true, now: Date.now() })
}
