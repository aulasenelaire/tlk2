export default function promiseMiddleware(client) {
  return ({dispatch, getState}) => {
    return next => action => {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }

      const {
        promise,
        types,
        requestData,
          ...rest,
      } = action;

      if (!promise) {
        return next(action);
      }

      const data = requestData || {};

      const [REQUEST, SUCCESS, FAILURE] = types;

      next({...rest, type: REQUEST, requestData: data});

      const actionPromise = promise(client);
      actionPromise.then(
        (result) => next({...rest, result, type: SUCCESS, requestData: data}),
        (error) => next({...rest, error, type: FAILURE, requestData: data})
      ).catch((error)=> {
        console.error('MIDDLEWARE ERROR:', error);
        next({...rest, error, type: FAILURE});
      });

      return actionPromise;
    };
  };
}
