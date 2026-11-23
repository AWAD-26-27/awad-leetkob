// Self-contained, zero-dependency React 18 compatible runtime
// Provides Component hooks, Context, Virtual DOM, persistent Fiber state, Ref binding, and Event handling.

export const Fragment = Symbol('Fragment');

export function createElement(type, props, ...children) {
  const p = props ? { ...props } : {};
  const flatChildren = children
    .flat(Infinity)
    .filter((c) => c !== null && c !== undefined && c !== false);
  p.children = flatChildren.length === 1 ? flatChildren[0] : flatChildren;
  return { type, props: p, key: p.key ?? null };
}

export const h = createElement;

// Fiber / Hook execution context
let currentComponent = null;
let hookIndex = 0;
let renderRoot = null;
let currentAppVNode = null;
let scheduledRender = null;

// Persistent component hierarchy state
const componentInstances = new Map();
let currentPath = 'root';
let compCounter = 0;

export function useState(initialValue) {
  const comp = currentComponent;
  if (!comp) {
    throw new Error('useState must be called within a component render context.');
  }
  const idx = hookIndex++;
  if (!comp._hooks[idx]) {
    comp._hooks[idx] = {
      state: typeof initialValue === 'function' ? initialValue() : initialValue,
    };
  }
  const hook = comp._hooks[idx];
  const setState = (newValue) => {
    const nextState = typeof newValue === 'function' ? newValue(hook.state) : newValue;
    if (!Object.is(hook.state, nextState)) {
      hook.state = nextState;
      scheduleUpdate();
    }
  };
  return [hook.state, setState];
}

export function useEffect(callback, deps) {
  const comp = currentComponent;
  if (!comp) {
    throw new Error('useEffect must be called within a component render context.');
  }
  const idx = hookIndex++;
  const prevHook = comp._hooks[idx];
  const hasChanged = !prevHook || !deps || deps.some((dep, i) => !Object.is(dep, prevHook.deps[i]));

  if (hasChanged) {
    if (prevHook?.cleanup) {
      try {
        prevHook.cleanup();
      } catch (e) {
        console.error(e);
      }
    }
    comp._hooks[idx] = { deps, cleanup: null, callback };
    comp._pendingEffects.push(comp._hooks[idx]);
  }
}

export function useRef(initialValue) {
  const comp = currentComponent;
  if (!comp) {
    // If called outside component context (e.g. static utility), return mutable ref object
    return { current: initialValue };
  }
  const idx = hookIndex++;
  if (!comp._hooks[idx]) {
    comp._hooks[idx] = { current: initialValue };
  }
  return comp._hooks[idx];
}

export function useMemo(factory, deps) {
  const comp = currentComponent;
  if (!comp) {
    throw new Error('useMemo must be called within a component render context.');
  }
  const idx = hookIndex++;
  const prevHook = comp._hooks[idx];
  const hasChanged = !prevHook || !deps || deps.some((dep, i) => !Object.is(dep, prevHook.deps[i]));

  if (hasChanged) {
    comp._hooks[idx] = { value: factory(), deps };
  }
  return comp._hooks[idx].value;
}

export function useCallback(callback, deps) {
  return useMemo(() => callback, deps);
}

export function createContext(defaultValue) {
  const context = {
    _currentValue: defaultValue,
    Provider({ value, children }) {
      context._currentValue = value !== undefined ? value : defaultValue;
      return children;
    },
  };
  return context;
}

export function useContext(context) {
  return context._currentValue;
}

function scheduleUpdate() {
  if (scheduledRender) return;
  scheduledRender = Promise.resolve().then(() => {
    scheduledRender = null;
    if (renderRoot && currentAppVNode) {
      compCounter = 0;
      currentPath = 'root';
      updateDOM(renderRoot, currentAppVNode);
    }
  });
}

export function createDOM(vnode, parentPath = 'root') {
  if (vnode === null || vnode === undefined || vnode === false) {
    return typeof document !== 'undefined' ? document.createTextNode('') : { text: '' };
  }
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return typeof document !== 'undefined'
      ? document.createTextNode(String(vnode))
      : { text: String(vnode) };
  }

  // Handle Arrays of VNodes (e.g. returned by Providers or multiple children)
  if (Array.isArray(vnode)) {
    if (typeof document === 'undefined') {
      return vnode.map((child, i) => createDOM(child, `${parentPath}.${i}`));
    }
    const frag = document.createDocumentFragment();
    vnode.forEach((child, i) => {
      const el = createDOM(child, `${parentPath}.${i}`);
      if (el) frag.appendChild(el);
    });
    return frag;
  }

  const { type, props = {} } = vnode || {};

  // Handle Fragments
  if (type === Fragment) {
    if (typeof document === 'undefined') return { type: 'Fragment', children: [] };
    const frag = document.createDocumentFragment();
    const children = Array.isArray(props.children)
      ? props.children
      : props.children
        ? [props.children]
        : [];
    for (const child of children) {
      frag.appendChild(createDOM(child, parentPath));
    }
    return frag;
  }

  // Handle Function Components
  if (typeof type === 'function') {
    const key = props?.key ?? compCounter++;
    const path = `${parentPath}/${type.name || 'Anonymous'}:${key}`;

    let instance = componentInstances.get(path);
    if (!instance) {
      instance = {
        _hooks: [],
        _pendingEffects: [],
        type,
        path,
      };
      componentInstances.set(path, instance);
    }
    instance.props = props;

    const prevComp = currentComponent;
    const prevHookIndex = hookIndex;
    currentComponent = instance;
    hookIndex = 0;

    let subVNode;
    try {
      subVNode = type(props);
    } finally {
      currentComponent = prevComp;
      hookIndex = prevHookIndex;
    }

    const prevPath = currentPath;
    const prevCounter = compCounter;
    currentPath = path;
    compCounter = 0;

    const dom = createDOM(subVNode, path);

    currentPath = prevPath;
    compCounter = prevCounter;

    if (dom && typeof dom === 'object') {
      dom._compInstance = instance;
    }

    // Run effects asynchronously
    Promise.resolve().then(() => {
      for (const eff of instance._pendingEffects) {
        try {
          eff.cleanup = eff.callback();
        } catch (e) {
          console.error(e);
        }
      }
      instance._pendingEffects = [];
    });

    return dom;
  }

  // Handle standard HTML elements
  if (typeof document === 'undefined') {
    return { type, props };
  }

  const el = document.createElement(type);

  // Attach ref if provided
  if (props?.ref) {
    if (typeof props.ref === 'function') {
      props.ref(el);
    } else if (typeof props.ref === 'object' && props.ref !== null) {
      props.ref.current = el;
    }
  }

  for (const [key, val] of Object.entries(props || {})) {
    if (key === 'children' || key === 'ref') continue;

    if (key.startsWith('on') && typeof val === 'function') {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, val);
    } else if (key === 'className' || key === 'class') {
      el.className = val || '';
    } else if (key === 'style' && typeof val === 'object') {
      Object.assign(el.style, val);
    } else if (key === 'defaultValue') {
      el.defaultValue = val;
      if (!el.value) el.value = val;
    } else if (key === 'disabled' || key === 'checked' || key === 'selected' || key === 'value') {
      el[key] = val;
      if (val) el.setAttribute(key, String(val));
      else el.removeAttribute(key);
    } else if (val !== false && val !== null && val !== undefined) {
      el.setAttribute(key, String(val));
    }
  }

  const children = Array.isArray(props.children)
    ? props.children
    : props.children
      ? [props.children]
      : [];
  for (const child of children) {
    el.appendChild(createDOM(child, parentPath));
  }

  return el;
}

function updateDOM(container, vnode) {
  if (typeof document === 'undefined' || !container) return;
  const newDOM = createDOM(vnode, 'root');
  container.innerHTML = '';
  container.appendChild(newDOM);
}

export function render(vnode, container) {
  renderRoot = container;
  currentAppVNode = vnode;
  compCounter = 0;
  currentPath = 'root';
  updateDOM(container, vnode);
}

export function evalComponent(vnode, parentPath = 'root') {
  if (vnode === null || vnode === undefined || vnode === false) return null;
  if (typeof vnode === 'string' || typeof vnode === 'number') return String(vnode);
  if (Array.isArray(vnode)) return vnode.map((c) => evalComponent(c, parentPath));

  const { type, props } = vnode;
  if (type === Fragment) {
    const children = Array.isArray(props?.children)
      ? props.children
      : props?.children
        ? [props.children]
        : [];
    return children.map((c) => evalComponent(c, parentPath));
  }

  if (typeof type === 'function') {
    const key = props?.key ?? compCounter++;
    const path = `${parentPath}/${type.name || 'Anonymous'}:${key}`;

    let instance = componentInstances.get(path);
    if (!instance) {
      instance = {
        _hooks: [],
        _pendingEffects: [],
        type,
        path,
      };
      componentInstances.set(path, instance);
    }
    instance.props = props;

    const prevComp = currentComponent;
    const prevHookIndex = hookIndex;
    currentComponent = instance;
    hookIndex = 0;

    let subVNode;
    try {
      subVNode = type(props);
    } finally {
      currentComponent = prevComp;
      hookIndex = prevHookIndex;
    }

    const prevPath = currentPath;
    const prevCounter = compCounter;
    currentPath = path;
    compCounter = 0;

    const res = evalComponent(subVNode, path);

    currentPath = prevPath;
    compCounter = prevCounter;
    return res;
  }

  const children = Array.isArray(props?.children)
    ? props.children
    : props?.children
      ? [props.children]
      : [];
  return {
    type,
    props: {
      ...props,
      children: children.map((c) => evalComponent(c, parentPath)),
    },
  };
}

export function resetComponentState() {
  componentInstances.clear();
  currentComponent = null;
  hookIndex = 0;
  compCounter = 0;
  currentPath = 'root';
}

export default {
  createElement,
  h,
  Fragment,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  createContext,
  useContext,
  render,
  createDOM,
  evalComponent,
  resetComponentState,
};
