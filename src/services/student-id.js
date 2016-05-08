/**
 * Get student id from url
 *
 * @param {String} url
 * @return {Maybe<Number>}
 */
export default function getStudentId(url = '') {
  var urlMatch = url.match(/\/dashboard\/student\/(\d+)\/summary\/session/);

  if (!urlMatch || !urlMatch[1]) return null;

  const id = urlMatch[1];

  if (!id) return null;

  return +id;
}
