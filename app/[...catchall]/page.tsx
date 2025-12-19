import { notFound } from 'next/navigation'

// This required catch-all route handles all unmatched paths (except root)
// and redirects to the custom 404 page
export default function NotFoundCatchAll({
  params,
}: {
  params: { catchall: string[] }
}) {
  notFound()
}


