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
export function timedAsync(sendDuration: (className: string, functionName: string, durationMs: number) => Promise<any>) {
    return function (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
        let functionName: string = propertyName;
        let className: string;
        if (typeof target === 'function') {
            className = target.name;
        } else {
            className = target.constructor.name;
        }
        let method = descriptor.value;
        descriptor.value = function () {
            let start = new Date();
            if (!method) {
                throw new Error('method missing');
            }
            return method.apply(this, arguments).then((r: any) => {
                sendDuration(className, functionName, new Date().valueOf() - start.valueOf());
                return r;
            });
        }
    }
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
export function timed(sendDuration: (className: string, functionName: string, durationMs: number) => Promise<any>) {
    return function (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
        let functionName: string = propertyName;
        let className: string;
        if (typeof target === 'function') {
            className = target.name;
        } else {
            className = target.constructor.name;
        }
        let method = descriptor.value;
        descriptor.value = function () {
            if (!method) {
                throw new Error('method missing');
            }
            let start = new Date();
            let ret = method.apply(this, arguments);
            sendDuration(className, functionName, new Date().valueOf() - start.valueOf());
            return ret;
        }
    }
}