class MPromise {
  constructor(fn) {
    this.callbackChain = [];
    this.resolveCallback = () => {};

    this._rejected = false;

    this._handleNext = this._handleNext.bind(this);
    this._handleResolve = this._handleResolve.bind(this);

    setTimeout(() => {
      fn(
        result => this._handleNext(result),
        error => {
          this._rejected = true;
          this._handleNext(error);
        }
      );
    }, 0);
  }

  then(callback) {
    this.callbackChain.push({ callback, type: "resolve" });
    return this;
  }

  catch(callback) {
    this.callbackChain.push({
      callback: error => {
        this._rejected = false;
        callback(error);
      },
      type: "reject"
    });
    return this;
  }

  _handleNext(result) {
    if (result instanceof MPromise) {
      result.onPromiseResolve(this._handleNext);
      return;
    }

    if (this.callbackChain.length === 0) {
      if (!this._rejected) {
        this._handleResolve(result);
      } else {
        throw new Error("Uncaught (in promise) Error: " + result.message);
      }
    } else {
      const next = this.callbackChain.shift();
      if (
        (next.type === "resolve" && !this._rejected) ||
        (next.type === "reject" && this._rejected)
      ) {
        setTimeout(() => {
          try {
            this._handleNext(next.callback(result));
          } catch (ex) {
            this._rejected = true;
            this._handleNext(ex);
          }
        });
      } else {
        this._handleNext(result);
      }
    }
  }

  _handleResolve(result) {
    this.resolveCallback(result);
  }

  onPromiseResolve(callback) {
    this.resolveCallback = callback;
  }
}

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
