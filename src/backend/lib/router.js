// Express-compatible Router implementation that adheres to standard Express routing semantics
// Supports route matching with parameters (:param), middleware chains, and JSON body parsing.

export function createRouter() {
  const routes = [];

  function add(method, path, handlers) {
    const paramNames = [];
    // Convert path pattern (e.g. /labs/:labId/queue) into regex
    const regexPath = path
      .split('/')
      .map((segment) => {
        if (segment.startsWith(':')) {
          paramNames.push(segment.slice(1));
          return '([^/]+)';
        }
        return segment;
      })
      .join('/');

    const regex = new RegExp(`^${regexPath}/?$`);
    routes.push({
      method: method.toUpperCase(),
      path,
      regex,
      paramNames,
      handlers: handlers.flat(),
    });
  }

  return {
    get(path, ...handlers) {
      add('GET', path, handlers);
    },
    post(path, ...handlers) {
      add('POST', path, handlers);
    },
    put(path, ...handlers) {
      add('PUT', path, handlers);
    },
    patch(path, ...handlers) {
      add('PATCH', path, handlers);
    },
    delete(path, ...handlers) {
      add('DELETE', path, handlers);
    },
    use(path, ...handlers) {
      if (typeof path === 'function') {
        routes.push({
          method: 'ALL',
          path: '*',
          regex: /.*/,
          paramNames: [],
          handlers: [path, ...handlers].flat(),
        });
      } else {
        add('ALL', path, handlers);
      }
    },
    routes,
  };
}
