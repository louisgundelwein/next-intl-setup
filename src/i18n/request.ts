import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { LocaleEnum } from '@/types';

export default getRequestConfig(async ({ requestLocale }) => {
	// This typically corresponds to the `[locale]` segment
	let locale = await requestLocale;

	// Ensure that a valid locale is used
	if (!locale || !routing.locales.includes(locale as LocaleEnum)) {
		locale = routing.defaultLocale;
	}

	return {
		locale,
		messages: (await import(`../../messages/${locale}.json`)).default,
	};
});
