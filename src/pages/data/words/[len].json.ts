import type { APIRoute } from 'astro';
import { LENGTHS } from '../../../lib/site';
import { RAW } from '../../../lib/words';

export function getStaticPaths() {
  return LENGTHS.map((len) => ({ params: { len: String(len) } }));
}
export const GET: APIRoute = ({ params }) =>
  new Response(JSON.stringify(RAW[Number(params.len)]), { headers: { 'Content-Type': 'application/json' } });
