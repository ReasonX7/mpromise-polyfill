import MPromise from "./MPromise";

MPromise.resolve = value => new MPromise(resolve => resolve(value));
MPromise.reject = error => new MPromise((resolve, reject) => reject(error));

new MPromise(resolve => setTimeout(resolve, 2000))
  .then(() => console.log("1: here"))
  .then(() => "1: some message")
  .then(console.log)
  .then(() => {
    throw new Error("1: some error");
  })
  .then(() => console.log("1: this should not be logged"))
  .catch(error => console.log("1: handle error:", error.message))
  .then(() => {
    return new MPromise(resolve =>
      setTimeout(() => resolve("1: MPromise message"), 2000)
    );
  })
  .then(console.log)
  .then(
    () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          reject("1: The promise was rejected");
        }, 3000);
      })
  );

MPromise.resolve("2: MPromise.resolve").then(console.log);

MPromise.reject(new Error("3: MPromise.reject"))
  .then(() => console.log("3: this should not be logged"))
  .catch(error => console.log("3:", error.message));
