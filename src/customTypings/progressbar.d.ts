declare namespace ProgressbarJs {
    class Circle {
        constructor(element?: Element, options?: any);

        destroy(): void;

        setText(text: string | number): void;

        set(n?: number): void;

        animate(n?: number): void;
    }
}

declare module "progressbar.js" {
    export = ProgressbarJs;
}
