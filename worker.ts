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

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function rewriteHtmlMeta(html: string, city: string, requestUrl: URL): string {
  const { title, description } = getCityPageMeta(city);
  const pathname = city ? `/${city}` : '/';
  const canonicalHost = requestUrl.hostname.endsWith(CANONICAL_HOST)
    ? CANONICAL_HOST
    : requestUrl.host;
  const canonicalUrl = `https://${canonicalHost}${pathname === '/' ? '/' : pathname}`;

  const safeTitle = escapeHtmlAttr(title);
  const safeDescription = escapeHtmlAttr(description);
  const safeCanonical = escapeHtmlAttr(canonicalUrl);

  let next = html;
  next = next.replace(/<title>[^<]*<\/title>/i, `<title>${safeTitle}</title>`);
  next = next.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${safeDescription}" />`,
  );
  next = next.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${safeTitle}" />`,
  );
  next = next.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${safeDescription}" />`,
  );
  next = next.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${safeCanonical}" />`,
  );
  next = next.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${safeCanonical}" />`,
  );
  return next;
}

async function serveSpaHtml(
  request: Request,
  env: Env,
  city: string,
): Promise<Response> {
  // Fetch the shell with a clean GET so we don't forward the original path/method.
  const indexRequest = new Request(new URL('/index.html', request.url), {
    method: 'GET',
    headers: { accept: 'text/html' },
  });
  const assetResponse = await env.ASSETS.fetch(indexRequest);
  if (!assetResponse.ok) return assetResponse;

  const html = await assetResponse.text();
  const rewritten = rewriteHtmlMeta(html, city, new URL(request.url));

  return new Response(rewritten, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
      'x-sqw-city': city || 'all',
    },
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
