/**
 * Created by meganschoendorf on 7/13/16.
 */

/**
 * This decorator calculates the time it takes the method to execute and calls the function sendDuration with the class
 * name, function name, and duration in ms.
 *
 * This decorator should only be used on methods that return a promise as the function sendDuration is called in a
 * .then clause. If your method does not return a promise, use the decorator timed.
 * @param sendDuration
 * @returns {function(any, string, TypedPropertyDescriptor<Function>): undefined}
 */
export interface extraDataDogTags {
    category?: string;
}

//   declare type MethodDecorator = <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;

export function timedAsync(
    sendDuration: (className: string, functionName: string, durationMs: number) => Promise<any>
): MethodDecorator {
    return (
        target: Object,
        propertyName: string | symbol,
        descriptor: TypedPropertyDescriptor<any>
    ) => {
        const functionName: string = String(propertyName);
        const className = target.constructor.name;
        const method = descriptor.value;
        descriptor.value = function() {
            const start = new Date();
            if (!method) {
                throw new Error('method missing');
            }
            return method.apply(this, arguments).then((r: any) => {
                try {
                    sendDuration(
                        className,
                        functionName,
                        new Date().valueOf() - start.valueOf()
                    ).catch(err => console.error({ err }, 'failed to send duration in timedAsync'));
                } catch (err) {
                    console.error({ err }, 'failed to send duration in timedAsync');
                }
                return r;
            });
        };
    };
}

export function timedAsyncWithTags(
    sendDurationWithTags: (
        className: string,
        functionName: string,
        durationMs: number,
        extraTags: Object
    ) => Promise<any>,
    extraTags: extraDataDogTags
): MethodDecorator {
    return (
        target: Object,
        propertyName: string | symbol,
        descriptor: TypedPropertyDescriptor<any>
    ) => {
        const functionName: string = String(propertyName);
        const className = target.constructor.name;
        const method = descriptor.value;
        descriptor.value = function() {
            const start = new Date();
            if (!method) {
                throw new Error('method missing');
            }
            return method.apply(this, arguments).then((r: any) => {
                try {
                    sendDurationWithTags(
                        className,
                        functionName,
                        new Date().valueOf() - start.valueOf(),
                        extraTags
                    ).catch(err =>
                        console.error({ err }, 'failed to send duration in timedAsyncWithTags')
                    );
                } catch (err) {
                    console.error({ err }, 'failed to send duration in timedAsyncWithTags');
                }
                return r;
            });
        };
    };
}

/**
 * This decorator calculates the time it takes the method to execute and calls the function sendDuration with the class
 * name, function name, and duration in ms.
 *
 * If your method returns a promise (eg an async method), consider using timedAsync instead as this will only measure
 * the amount of time required to return the promise, not to resolve it.
 * @param sendDuration
 * @returns {function(any, string, TypedPropertyDescriptor<Function>): undefined}
 */
export function timed(
    sendDuration: (className: string, functionName: string, durationMs: number) => Promise<any>
): MethodDecorator {
    return (
        target: Object,
        propertyName: string | symbol,
        descriptor: TypedPropertyDescriptor<any>
    ) => {
        const functionName: string = String(propertyName);
        const className = target.constructor.name;
        const method = descriptor.value;
        descriptor.value = function() {
            if (!method) {
                throw new Error('method missing');
            }
            const start = new Date();
            const ret = method.apply(this, arguments);
            try {
                sendDuration(
                    className,
                    functionName,
                    new Date().valueOf() - start.valueOf()
                ).catch(err => console.error({ err }, 'failed to send duration in timed'));
            } catch (err) {
                console.error({ err }, 'failed to send duration in timed');
            }
            return ret;
        };
    };
}
