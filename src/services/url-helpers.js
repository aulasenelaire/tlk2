/**
 * Transform a javascript object into URL query string
 *
 * @param {Object} params
 * @return {Object}
 */
export default function objectToParams(params) {
  return Object.keys(params).reduce(function(accum, key){
    accum.push(`${key}=${encodeURIComponent(params[key])}`);

    return accum;
  }, [])
  .join('&');
}
