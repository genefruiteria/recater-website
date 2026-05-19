# ReCater Website

Single-page marketing site rebuilt from the Framer page so it can be hosted on a free static tier with a custom domain.

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

The static output is generated in `dist/`.

## Free Custom-Domain Hosting

Good options:

- Vercel: set the project root directory to this folder, build command `npm run build`, output directory `dist`.
- Netlify: build command `npm run build`, publish directory `dist`.
- Cloudflare Pages: build command `npm run build`, build output directory `dist`.

After deployment, add the custom domain in the host dashboard and update DNS records where the domain is registered.
