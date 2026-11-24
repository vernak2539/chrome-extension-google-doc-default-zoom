// The right-to-left locales in public/_locales, and only those: in another RTL language (Persian,
// Urdu) the browser falls back to the English strings, which must stay left-to-right
const RTL_LANGUAGES: Record<string, true> = { ar: true, he: true };

export const getTextDirection = (uiLanguage: string): "ltr" | "rtl" =>
  RTL_LANGUAGES[uiLanguage.split(/[-_]/)[0].toLowerCase()] ? "rtl" : "ltr";

export const applyTextDirection = () => {
  document.documentElement.dir = getTextDirection(chrome?.i18n?.getUILanguage?.() ?? "en");
};
