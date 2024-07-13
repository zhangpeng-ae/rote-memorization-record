let activeEffect = null;

let targetMap = new WeakMap();

const proxyMap = new WeakMap();

const isObject = (val) => val !== null && typeof val === "object";

const isArray = Array.isArray;

function reactive(target) {
  return createReactive(target);
}

function createReactive(target) {
  if (isObject(target)) {
    return target;
  }

  if (proxyMap.has(target)) {
    return proxyMap.get(target);
  }

  const proxy = new Proxy(target, baseHandler);
  return proxy;
}

const baseHandler = {
  get: getter,
  set: setter,
};

function getter(target, key, receiver) {
  const result = Reflect.get(target, key, receiver);

  track(target, key);

  return result;
}

function setter(target, key, value, receiver) {
  const result = Reflect.set(target, key, value, receiver);

  trigger(target, key);

  return result;
}

function track(target, key) {
  let wm = targetMap.get(target);
  if (!wm) {
    targetMap.set(target, (wm = new Map()));
  }

  let dep = wm.get(key);
  if (!dep) {
    wm.set(key, (dep = new Set()));
  }

  if (activeEffect) {
    dep.add(activeEffect);
  }
}

function trigger(target, key) {
  const wm = targetMap.get(target);
  if (!wm) {
    return;
  }

  const dep = wm.get(key);
  if (!dep) {
    return;
  }

  dep.forEach((effect) => {
    effect.run();
  });
}

function effect(fn) {
  const effect = new ReactiveEffect(fn);

  effect.run();
}

class ReactiveEffect {
  constructor(fn) {
    this.fn = fn;
  }
  run() {
    activeEffect = this;
    this.fn();
  }
  stop() {
    activeEffect = null;
  }
}

function ref(value) {
  if (value._isRef) {
    return value;
  }

  return new RefImpl(value);
}

class RefImpl {
  _value;
  _isRef = true;
  dep = undefined;
  constructor(value) {
    this._value = isObject(value) ? reactive(value) : value;
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    this._value = newValue;
    triggerRefValue(this);
  }
}

function createDep(effects) {
  const dep = new Set(effects);
  return dep;
}

function trackRefValue(ref) {
  if (activeEffect) {
    trackEffects(ref.dep || (ref.dep = createDep()));
  }
}

function trackEffects(dep) {
  dep.add(activeEffect);
}

function triggerRefValue(ref) {
  if (ref.dep) {
    triggerEffects(ref.dep);
  }
}

function triggerEffects(dep) {
  const effects = isArray ? dep : [...dep];

  effects.forEach((effect) => {
    effect.run();
  });
}
