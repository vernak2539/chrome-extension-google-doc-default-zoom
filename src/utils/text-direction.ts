// Right-to-left languages that ship a locale in public/_locales, and only those. A browser in any other RTL language
// (or in one of these before its locale ships) gets the English fallback strings, which must stay left-to-right.
// src/utils/text-direction.test.ts fails when this list and the locale folders disagree.
export const RTL_LANGUAGES: Record<string, true> = { ar: true, he: true };

export const getTextDirection = (
  uiLanguage: string,
  rtlLanguages: Record<string, true> = RTL_LANGUAGES
): "ltr" | "rtl" => (rtlLanguages[uiLanguage.split(/[-_]/)[0].toLowerCase()] ? "rtl" : "ltr");

export const applyTextDirection = () => {
  document.documentElement.dir = getTextDirection(chrome?.i18n?.getUILanguage?.() ?? "en");
};
