export declare type Cancellable<T extends (...args: any[]) => void> = {
    (...args: Parameters<T>): void;
    cancel(): void;
};
export declare const smoothFunction: <T extends (...args: any[]) => void>(callback: T) => Cancellable<T>;
export declare const setRequestTimeout: (fn: Function, delay?: number, ...args: any[]) => {
    [x: string]: any;
};
export declare const clearRequestTimeout: (handle: any) => void;
