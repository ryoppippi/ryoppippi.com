const DEFAULT_SITE_ORIGIN = 'https://ryoppippi.com';

/**
 * Canonical origin used when generating absolute site URLs.
 */
export const SITE_ORIGIN = import.meta.env.PUBLIC_ORIGIN || DEFAULT_SITE_ORIGIN;

/**
 * Site identity values shared by generated pages and templates.
 */
export const SITE_NAME = 'ryoppippi.com';

/**
 * JPEG URL used by social cards and feed metadata for broad consumer compatibility.
 */
export const SITE_SOCIAL_IMAGE_URL = `${SITE_ORIGIN}/ryoppippi.jpg`;

/** The licence, period, and holder applied to original blog content. */
export const SITE_COPYRIGHT = 'CC BY-NC-SA 4.0 2022-PRESENT © ryoppippi';
