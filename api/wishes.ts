import type { IncomingMessage, ServerResponse } from 'node:http';
import { Pool } from 'pg';
import { SCHEMA_SQL } from './_schema.js';
import {
  ownershipHash, editWish, deleteWish, type Db, insertWish, isRateLimited, listWishes, parseWish, senderHash,
} from './_store.js';

/**
 * GET  /api/wishes  → the wishes and RSVPs, newest first
 * POST /api/wishes  → add one
 *
 * One pool per warm lambda. Point DATABASE_URL at a POOLED connection string
 * (Neon's -pooler host, or Supabase's transaction pooler on 6543): serverless
 * opens and drops connections far too often for a direct one.
 */
let pool: Pool | undefined;
function db(): Db {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL is not set');
    pool = new Pool({
      connectionString,
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
      ssl: connectionString.includes('sslmode=disable') ? undefined : { rejectUnauthorized: false },
    });
  }
  return pool;
}

/**
 * Applies the schema once per warm instance. Everything in it is `if not
 * exists` or `create or replace`, so concurrent cold starts racing each other
 * is harmless — Postgres may still raise a duplicate-object error on the
 * catalog index, which is why the failure is swallowed and retried next call.
 */
let schemaReady: Promise<void> | undefined;
function ensureSchema(d: Db): Promise<void> {
  schemaReady ??= d.query(SCHEMA_SQL).then(
    () => undefined,
    (err: unknown) => {
      schemaReady = undefined;
      const code = (err as { code?: string }).code;
      // 23505 unique_violation, 42P07 duplicate_table: another instance won.
      if (code !== '23505' && code !== '42P07') throw err;
    },
  );
  return schemaReady;
}

function clientIp(req: IncomingMessage): string {
  const fwd = req.headers['x-forwarded-for'];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd;
  return (raw?.split(',')[0] ?? req.socket.remoteAddress ?? 'unknown').trim();
}

function send(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const d = db();
    await ensureSchema(d);

    if (req.method === 'GET') {
      // Short on purpose. A longer window survives a burst more cheaply, but
      // a guest who posts and then shows a friend must not be told the feed is
      // empty — five seconds keeps it feeling live while still collapsing a
      // thundering herd onto one origin read.
      res.setHeader('cache-control', 'no-store');
      return send(res, 200, { wishes: await listWishes(d) });
    }

    if (['POST', 'PATCH', 'DELETE'].includes(req.method ?? '')) {
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const c of req) {
        size += (c as Buffer).length;
        if (size > 8192) return send(res, 413, { error: 'Ucapan terlalu besar' });
        chunks.push(c as Buffer);
      }
      let body: unknown;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
      } catch {
        return send(res, 400, { error: 'Body tidak valid' });
      }

      const b = body as Record<string, unknown> | null;
      const hash = ownershipHash(b?.editToken);
      if (req.method !== 'POST') {
        res.setHeader('cache-control', 'no-store');
        if (!hash || (b?.id !== null && (typeof b?.id !== 'string' || !/^[1-9][0-9]{0,18}$/.test(b.id)))) {
          return send(res, 403, { error: 'Ucapan ini hanya dapat diubah dari browser pengirim.' });
        }
        if (req.method === 'DELETE') {
          const removed = await deleteWish(d, b!.id as string | null, hash);
          return send(res, (removed || b?.id === null) ? 200 : 403, (removed || b?.id === null) ? { deleted: true } : { error: 'Tidak dapat menghapus ucapan ini.' });
        }
        if (b?.id === null) return send(res, 400, { error: 'ID ucapan belum tersedia.' });
        const message = typeof b!.message === 'string' ? (b!.message as string).trim() : '';
        if (!message || message.length > 200) return send(res, 400, { error: 'Ucapan harus berisi 1–200 karakter.' });
        const wish = await editWish(d, b!.id as string, hash, message);
        return send(res, wish ? 200 : 403, wish ? { wish } : { error: 'Tidak dapat mengubah ucapan ini.' });
      }
      if (b?.editToken !== undefined && !hash) return send(res, 400, { error: 'Kunci ucapan tidak valid.' });
      const parsed = parseWish(body);
      if (!parsed.ok) return send(res, 400, { error: parsed.error });

      const sender = senderHash(clientIp(req), process.env.SENDER_SALT ?? 'wedding-quest');
      const existing = hash ? await d.query('select id from wishes where edit_hash = $1', [hash]) : { rows: [] };
      if (!existing.rows.length && await isRateLimited(d, sender)) {
        return send(res, 429, { error: 'Sabar ya, ucapanmu sudah terkirim 🙏' });
      }

      return send(res, 201, { wish: await insertWish(d, parsed.wish, sender, hash) });
    }

    res.setHeader('allow', 'GET, POST, PATCH, DELETE');
    return send(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/wishes]', err);
    return send(res, 500, { error: 'Server sedang bermasalah' });
  }
}
