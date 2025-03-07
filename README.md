# Basic Next-Intl Setup

for more Infos: [Docs](https://next-intl.dev/)

**Installing:**
```bash 
npx create-next-app@latest
```

```bash 
pnpm install next-intl
```

**Folder-Structure**
```bash 
├── messages
│   ├── en.json
│   └── ...
├── next.config.ts
└── src
	├── types.ts
    ├── i18n
    │   ├── routing.ts
    │   ├── navigation.ts
    │   └── request.ts
    ├── middleware.ts
    └── app
        └── [locale]
            ├── layout.tsx
            └── page.tsx
```

**File-Setup**
`messages/en.json`
```json
{
  "HomePage": {
    "title": "Hello world!",
    "about": "Go to the about page"
  }
}
```

`next.config.ts`
```typescript
import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const nextConfig: NextConfig = {};
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
```

`src/i18n/routing.ts`
```typescript
import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'de'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});
```

`src/i18n/navigation.ts`
```typescript
import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';
 
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
```

`src/i18n/request.ts`
```typescript
import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
 
export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
 
  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
```

`src/middleware.ts`
```typescript
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(de|en)/:path*']
};
```

A bit more complex:
`src/middleware.ts`
```typescript
export const config = {
  // Matcher entries are linked with a logical "or", therefore
  // if one of them matches, the middleware will be invoked.
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // However, match all pathnames within `/users`, optionally with a locale prefix
    '/([\\w-]+)?/users/(.+)'
  ]
};
```

`src/types.ts`
```typescript
export type LocaleEnum = 'en' | 'de'
```

`src/app/[locale]/layout.tsx`
```typescript
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import type {LocaleEnum} from '@/types'
 
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  // Ensure that the incoming `locale` is valid
  const {locale} = await params;
  if (!routing.locales.includes(locale as LocaleEnum)) {
    notFound();
  }
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

`src/app/[locale]/page.tsx`
```typescript
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
 
export default function HomePage() {
  const t = useTranslations('HomePage');
  return (
    <div>
      <h1>{t('title')}</h1>
      <Link href="/about">{t('about')}</Link>
    </div>
  );
}
```

## How to use messages
```json
{
  "About": {
    "title": "About us"
  }
}
```

```typescript
import {useTranslations} from 'next-intl';
 
function About() {
  const t = useTranslations('About');
  return <h1>{t('title')}</h1>;
}
```
or
```typescript
import {useTranslations} from 'next-intl';
 
function About() {
  const t = useTranslations();
  return <h1>{t('About.title')}</h1>;
}
```

This is also possible:
```typescript
t('message', {name: 'Jane'}); // "Hello Jane!"
```

## Navigation
Basically, use i18n routing :)
`navigation.ts`
```typescript 
import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';
 
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
```

**Link**
```typescript
import {Link} from '@/i18n/navigation';
 
// When the user is on `/en`, the link will point to `/en/about`
<Link href="/about">About</Link>
 
// Search params can be added via `query`
<Link href={{pathname: "/users", query: {sortBy: 'name'}}}>Users</Link>
 
// You can override the `locale` to switch to another language
// (this will set the `hreflang` attribute on the anchor tag)
<Link href="/" locale="de">Switch to German</Link>



// 1. A final string (when not using `pathnames`)
<Link href="/users/12">Susan</Link>
 
// 2. An object (when using `pathnames`)
<Link href={{
  pathname: '/users/[userId]',
  params: {userId: '5'}
}}>
  Susan
</Link>
```

**useRouter**
```typescript
'use client';
 
import {useRouter} from '@/i18n/navigation';
 
const router = useRouter();
 
// When the user is on `/en`, the router will navigate to `/en/about`
router.push('/about');
 
// Search params can be added via `query`
router.push({
  pathname: '/users',
  query: {sortBy: 'name'}
});
 
// You can override the `locale` to switch to another language
router.replace('/about', {locale: 'de'});
```

**usePathname**
```typescript
'use client';
 
import {usePathname} from '@/i18n/navigation';
 
// When the user is on `/en`, this will be `/`
const pathname = usePathname();
```

**redirect**
```typescript
import {redirect} from '@/i18n/navigation';
 
// Redirects to `/en/login`
redirect({href: '/login', locale: 'en'});
 
// Search params can be added via `query`
redirect({href: '/users', query: {sortBy: 'name'}, locale: 'en'});
```

**getPathname**
```typescript
import {getPathname} from '@/i18n/navigation';
 
// Will return `/en/about`
const pathname = getPathname({
  locale: 'en',
  href: '/about'
});
 
// Search params can be added via `query`
const pathname = getPathname({
  locale: 'en',
  href: {
    pathname: '/users',
    params: {sortBy: 'name'}
  }
});
```
