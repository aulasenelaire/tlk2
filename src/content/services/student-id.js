/**
 * Get student id from url
 *
 * @param {String} url
 * @return {Maybe<Number>}
 */
export default function getStudentId(url = '') {
  var urlMatch = url.match(/\/dashboard\/student\/(\d+)\/summary\/session/);

  if (!urlMatch || !urlMatch[1]) return null;

  return urlMatch[1];
}
