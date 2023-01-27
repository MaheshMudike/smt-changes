declare module 'rtl-detect' {
    const rtlDetect: {
        isRtlLang: (lang: string) => boolean,
        getLangDir: (lang: string) => string
    };
    export default rtlDetect;
}
