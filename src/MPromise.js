class MPromise {
  constructor(fn) {
    this.callbackChain = [];

    this._rejected = false;

    this._handleNext = this._handleNext.bind(this);

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
      result.then(this._handleNext);
      return;
    }

    if (this.callbackChain.length === 0) {
      if (this._rejected) {
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
        }, 0);
      } else {
        this._handleNext(result);
      }
    }
  }
}

MPromise.resolve = value => new MPromise(resolve => resolve(value));
MPromise.reject = error => new MPromise((resolve, reject) => reject(error));

export default MPromise;
