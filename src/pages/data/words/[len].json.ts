import type { APIRoute } from 'astro';
import { LENGTHS } from '../../../lib/site';
import { RAW, getData } from '../../../lib/words';

export function getStaticPaths() {
  return LENGTHS.map((len) => ({ params: { len: String(len) } }));
}
export const GET: APIRoute = ({ params }) =>
  new Response(JSON.stringify({ ...RAW[Number(params.len)], c: [...getData(Number(params.len)).common].sort((a, b) => a - b) }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
