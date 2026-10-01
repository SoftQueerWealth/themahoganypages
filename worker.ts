import { getCityPageMeta } from './src/lib/cityMeta';
import { cityFromPathname } from './src/lib/cityPath';

const CANONICAL_HOST = 'softqueerwealth.com';

interface Env {
  ASSETS: Fetcher;
}

function hasFileExtension(pathname: string): boolean {
  const last = pathname.split('/').pop() ?? '';
  return last.includes('.');
}

function rewriteHtmlMeta(html: string, city: string, requestUrl: URL): string {
  const { title, description } = getCityPageMeta(city);
  const pathname = city ? `/${city}` : '/';
  const canonicalHost = requestUrl.hostname.endsWith(CANONICAL_HOST)
    ? CANONICAL_HOST
    : requestUrl.host;
  const canonicalUrl = `https://${canonicalHost}${pathname === '/' ? '/' : pathname}`;

  let next = html;
  next = next.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
  next = next.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${description}" />`,
  );
  next = next.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${title}" />`,
  );
  next = next.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${description}" />`,
  );
  next = next.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`,
  );
  next = next.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${canonicalUrl}" />`,
  );
  return next;
}

async function serveSpaHtml(
  request: Request,
  env: Env,
  city: string,
): Promise<Response> {
  const indexUrl = new URL('/index.html', request.url);
  const assetResponse = await env.ASSETS.fetch(new Request(indexUrl, request));
  if (!assetResponse.ok) return assetResponse;

  const html = await assetResponse.text();
  const rewritten = rewriteHtmlMeta(html, city, new URL(request.url));

  const headers = new Headers(assetResponse.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.delete('content-length');

  return new Response(rewritten, {
    status: 200,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    const isWWW = url.hostname === 'www.softqueerwealth.com';

    // Only redirect www → apex
    if (isWWW) {
      url.hostname = CANONICAL_HOST;
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    const { pathname } = url;
    const city = cityFromPathname(pathname);

    // Known city deep links: SPA shell + city-specific meta
    if (city) {
      return serveSpaHtml(request, env, city);
    }

    // Non-file paths (future SPA routes): fall back to index without city meta
    if (pathname !== '/' && !hasFileExtension(pathname)) {
      return serveSpaHtml(request, env, '');
    }

    // For everything else (including staging), DO NOT redirect
    return env.ASSETS.fetch(request);
  },
};
