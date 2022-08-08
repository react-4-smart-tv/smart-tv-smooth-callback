const nowCustom = () => {
  try {
    return window.performance.now();
  } catch (error) {
    return Date.now();
  }
};

const _now =
  nowCustom ||
  function () {
    return new Date().getTime();
  };

export type Cancellable<T extends (...args: any[]) => void> = {
  (...args: Parameters<T>): void;
  cancel(): void;
};

type WindowWithoutRAF = Omit<Window, "requestAnimationFrame">;

type WrapperState = {
  cancelToken: number;
  callbackThis?: any;
  args?: any[];
};

const wrapperFactory = function () {
  const state: WrapperState = {
    cancelToken: 0,
  };

  const resetCancelToken = () => {
    state.cancelToken = 0;
  };

  const wrapper = <T extends Function>(cbThis: any, cb: T, ...args: any[]) => {
    state.callbackThis = cbThis;
    state.args = args;

    if (state.cancelToken) {
      return;
    }

    if ("requestAnimationFrame" in window) {
      state.cancelToken = window.requestAnimationFrame(() => {
        cb.apply(state.callbackThis, state.args);
        resetCancelToken();
      });
    } else {
      cb.apply(state.callbackThis, state.args);
      state.cancelToken = (window as WindowWithoutRAF).setTimeout(
        resetCancelToken,
        1000 / 60
      );
    }
  };

  wrapper.cancel = () => {
    if ("requestAnimationFrame" in window) {
      window.cancelAnimationFrame(state.cancelToken);
    }
    window.clearTimeout(state.cancelToken);
    resetCancelToken();
  };

  return wrapper as Cancellable<typeof wrapper>;
};

const throttleFactory = function <T extends (...args: any[]) => void>(
  callback: T,
  thisArg?: any,
  ...argArray: any[]
): Cancellable<T> {
  const wrapper = wrapperFactory();
  const argCount = arguments.length;
  const throttledCallback = function (this: any, ...args: Parameters<T>) {
    wrapper(argCount > 1 ? thisArg : this, callback, ...argArray, ...args);
  };
  throttledCallback.cancel = () => wrapper.cancel();
  return throttledCallback;
};

export const smoothFunction = <T extends (...args: any[]) => void>(
  callback: T
): Cancellable<T> => {
  const throttledCallback = throttleFactory(callback);
  throttledCallback.bind = throttleFactory.bind(null, callback);
  return throttledCallback;
};

export const setRequestTimeout = (fn: Function, delay = 0, ...args: any[]) => {
  let this_ = this;
  const start = _now();
  const handle: { [key in string]: any } = {};
  const loop = () => {
    const current = _now();
    const delta = current - start;
    if (delta >= delay) {
      fn.call(this_, ...args);
    } else {
      if ("requestAnimationFrame" in window) {
        handle.value = window.requestAnimationFrame(loop);
      } else {
        handle.value = (window as WindowWithoutRAF).setTimeout(loop, 1000 / 60);
      }
    }
  };
  if ("requestAnimationFrame" in window) {
    handle.value = window.requestAnimationFrame(loop);
  } else {
    handle.value = (window as WindowWithoutRAF).setTimeout(loop, 1000 / 60);
  }
  return handle;
};

export const clearRequestTimeout = (handle: any) => {
  if (typeof handle === "undefined" || handle === null) return;
  if ("requestAnimationFrame" in window) {
    window.cancelAnimationFrame(handle.value);
    return;
  }
  window.clearTimeout(handle.value);
};
