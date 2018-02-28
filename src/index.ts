/**
 * Created by meganschoendorf on 7/13/16.
 */

export interface extraDataDogTags {
    category?: string;
}

/**
 * This decorator calculates the time it takes the method to execute and calls the function sendDuration with the class
 * name, function name, and duration in ms.
 *
 * This decorator should only be used on methods that return a promise as the function sendDuration is called in a
 * .then clause. If your method does not return a promise, use the decorator timed.
 * @param sendDuration
 * @returns {function(any, string, TypedPropertyDescriptor<Function>): undefined}
 */
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
            const start = process.hrtime();
            if (!method) {
                throw new Error('method missing');
            }
            return method.apply(this, arguments).then((r: any) => {
                if (process.env.DISABLE_TS_TIMED === 'true') return r;
                try {
                    const diff = process.hrtime(start);
                    const dur = Math.round(diff[0] * 1e3 + diff[1] * 1e-6);
                    sendDuration(className, functionName, dur).catch(err =>
                        console.error({ err }, 'failed to send duration in timedAsync')
                    );
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
            const start = process.hrtime();
            if (!method) {
                throw new Error('method missing');
            }
            return method.apply(this, arguments).then((r: any) => {
                if (process.env.DISABLE_TS_TIMED === 'true') return r;
                try {
                    const diff = process.hrtime(start);
                    const dur = Math.round(diff[0] * 1e3 + diff[1] * 1e-6);
                    sendDurationWithTags(className, functionName, dur, extraTags).catch(err =>
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
            const start = process.hrtime();
            const ret = method.apply(this, arguments);
            if (process.env.DISABLE_TS_TIMED === 'true') return ret;
            try {
                const diff = process.hrtime(start);
                const dur = Math.round(diff[0] * 1e3 + diff[1] * 1e-6);
                sendDuration(className, functionName, dur).catch(err =>
                    console.error({ err }, 'failed to send duration in timed')
                );
            } catch (err) {
                console.error({ err }, 'failed to send duration in timed');
            }
            return ret;
        };
    };
}
