export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'k2bhj8hq',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-06-24',
  // CDN is fine with page-level revalidate; live API was slowing every request.
  useCdn: true,
}
