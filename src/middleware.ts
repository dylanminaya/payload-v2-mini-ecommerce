import createMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  matcher: ['/((?!api|_next|admin|favicon.ico|favicon.svg|.*\\..*).*)'],
};
