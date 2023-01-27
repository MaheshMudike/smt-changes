interface IInvalidatable {
    invalidate: () => void;
}

/* tslint:disable-next-line:ban-types */
export function cachedFunction<T extends Function>(f: T): T & IInvalidatable {
    let cache: { [index: string]: any } = {};

    const result: any = (...args: any[]) => {
        const index = JSON.stringify(args);
        if (cache[index] === undefined) {
            cache[index] = f.apply(undefined, args);
        }
        return cache[index];
    };

    result.invalidate = () => cache = {};

    return result;
}
