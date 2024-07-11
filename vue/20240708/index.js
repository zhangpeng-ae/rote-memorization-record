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
      console.log('%c [ key ]-17', 'font-size:13px; background:pink; color:#bf2c9f;', key)
      let res = target[key];
      // const value = Reflect.get(target, key, receiver);
      track(target, key);
      return res;
    },
    set(target, key, value, receiver) {
      console.log('%c [ key ]-23', 'font-size:13px; background:pink; color:#bf2c9f;', key)
      target[key] = value;
      trigger(target, key);
      return true;
    },
  });

  return proxy;
}

function track(target, key) {
  if (!activeEffect) {
    return;
  }

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

  for (const effect of effects) {
    effect();
  }
}
