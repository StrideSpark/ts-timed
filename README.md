# ts-timed
Typescript decorators for timing async and synchronous functions


# Example Usage

```
class Bar {
     @timedAsync((className, funcName, duration) => {console.log(className, funcName, duration); return Promise.resolve()})
     public static async foo() {
         let result = await new Promise((res, rej) => setTimeout(() => res("this is a test"), 1000));
         console.log(result);
         return result;
     }
 }

 Bar.foo().then(r => console.log(r));

 ```