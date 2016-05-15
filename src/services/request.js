import CONSTANTS from 'constants';

function formatUrl(path) {
  return `${CONSTANTS.BASE_API}/${path}`;
}

class requestClient {
  constructor() {
    ['get', 'post', 'put', 'patch', 'del'].forEach((method) =>
      this[method] = (path, { data, token } = {}) => new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        const url = formatUrl(path);

        req.onload = () => {
          if (req.status === 500) {
            reject(req.response);
            return;
          }

          if (req.response.length > 0) {
            resolve(JSON.parse(req.response));
            return;
          }

          resolve(null);
        };

        /**
         * Only covers network errors between the browser and the Express HTTP proxy
         */
        req.onerror = () => {
          reject(null);
        };

        req.open(method, url);
        req.setRequestHeader('Accept', 'application/json');
        req.setRequestHeader('Content-Type', 'application/json');
        req.setRequestHeader('Token', token);
        req.send(JSON.stringify(data));
      })
    );
  }
}

export default requestClient;
