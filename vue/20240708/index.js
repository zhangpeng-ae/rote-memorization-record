const wm = new WeakMap();

let activeEffect = null;

function effect(fn) {
  activeEffect = fn;
  fn();
}

function reactive(target) {
  if (target === null || typeof target !== "object") {
    return target;
  }

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      track(target, key);
      return value;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key);
      return result;
    },
  });

  return proxy;
}

function track(target, key) {
  let map = wm.get(target);
  if (!map) {
    wm.set(target, (map = new Map()));
  }

  let deps = map.get(key);
  if (!deps) {
    map.set(key, (deps = new Set()));
  }

  deps.add(activeEffect);

  activeEffect = null;
}

function trigger(target, key) {
  const deps = wm.get(target);
  if (!deps) {
    return;
  }

  const effects = deps.get(key);
  if (!effects) {
    return;
  }

  effects.forEach((effect) => {
    if (effect !== activeEffect) {
      effect();
    }
  });
}
