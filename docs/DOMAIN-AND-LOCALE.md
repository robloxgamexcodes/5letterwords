# Domain and locale

`.se` is Sweden's country-code domain. Google treats it as geo-targeted to Sweden and this cannot be changed in Search Console. For an English audience in the US, UK, India and elsewhere it is a headwind. The site is new, so moving costs the least now.

## Staying on .se
Nothing to do. `hreflang="en"` and `x-default` are already emitted.

## Moving to a generic domain (recommended)
1. Add the new domain in Vercel and make it primary.
2. Set `PUBLIC_SITE_URL=https://your-domain` and redeploy. Canonicals, schema, sitemap and robots follow it. Update the URLs inside `public/llms.txt` by hand.
3. Add a permanent redirect in `vercel.json`: `"redirects": [{ "source": "/(.*)", "has": [{ "type": "host", "value": "5letterwords.se" }], "destination": "https://your-domain/$1", "permanent": true }]`
4. Use Change of Address in Search Console and submit the new sitemap.
5. Create the `contact@` mailbox (the address is derived from the host).

## Other languages
Add them as subfolders (`/es/`, `/de/`) with native word lists and hreflang pairs, not translations of the English lists. Check demand in Search Console first.
