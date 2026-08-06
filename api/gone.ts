export default function gone(): Response {
  return new Response('Cette ressource n’est plus disponible.', {
    status: 410,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'text/plain; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
    },
  })
}
