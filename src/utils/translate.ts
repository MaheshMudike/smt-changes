import * as _ from 'lodash';
import * as moment from 'moment';

let lang: string;
let bcp47Language: string;
const allDictionaries: _.Dictionary<_.Dictionary<string>> = {};

export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_LOCALE = 'en-US';

export function initializeLanguageData(language: string, translations: _.Dictionary<string>) {    
    allDictionaries[language] = translations;    
}

export function setLanguageAndLocale(language: string, localeSidKey: string) {
    lang = language;
    bcp47Language = lang.replace('_', '-');

    const [localeLang, country, currency] = localeSidKey.split('_');
    const locale = [localeLang, country].join('-');
    moment.locale(locale);
}

export const getLangWithoutLocale = (language = lang) => language.split(/[_-]/)[0];

export function translateOrDefault(key: string, defaultValue: string) {
    const translation = getTranslation(lang, key);
    if(translation != null) return translation;
    
    const defaultTranslation = getTranslation(DEFAULT_LANGUAGE, key);
    if(defaultTranslation != null) return defaultTranslation;

    return defaultValue;
    
    //empty string evaluates to false...
    //return getTranslation(lang, key) || getTranslation(DEFAULT_LOCALE, key) || defaultValue;
}

function getTranslation(lang: string, key: string) {
    const dict = allDictionaries[lang];    
    return dict != null && dict[key] != null && (dict[key] != '' || lang == DEFAULT_LANGUAGE) ? dict[key] : null;
}

export default function translate(key: string) {
    return translateOrDefault(key, key);
}
