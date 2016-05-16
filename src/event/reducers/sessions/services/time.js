import _ from 'underscore';
import moment from 'moment';

/**
 * Returns a moment object for session creation time
 *
 * @param {String} creation_time
 * @return {Moment}
 */
export function getCreationTime(creation_time) {
  return moment(creation_time);
}

/**
 * Check if creationTime is on the first part of the year
 * we split a year in 2 parts
 *
 * @param {Moment} creationTime
 * @param {Number} currentYear
 * @return {Boolean}
 */
function isFirstPart(creationTime, currentYear) {
  const startYear = moment().set({
    date: 1, M: 0, year: currentYear, hour: 0, minute: 0, second: 0
  });
  const middleYear = moment().set({
    date: 30, M: 7, date: 1, year: currentYear, hour: 23, minute: 59, second: 59
  });

  return creationTime.isBetween(startYear, middleYear);
}

/**
 * Split year in 2 parts
 *
 * @param {Moment} creationTime
 * @return {Object}
 */
function splitYear(creationTime) {
  const currentYear = creationTime.year();
  const prevYear = currentYear - 1;
  const nextYear = currentYear + 1;
  const isFirstPartOfYear = isFirstPart(creationTime, currentYear);

  return {
    firstPart: isFirstPartOfYear ? prevYear : currentYear,
    secondPart: isFirstPartOfYear ? currentYear : nextYear,
  };
}

/**
 * Build trimesters array
 *
 * @return {Moment} creationTime
 * @return {Array}
 */
function buildTrimesters(creationTime) {
  const year = splitYear(creationTime);

  return [
    {
      name: '1tr',
      start: moment().set({date: 1, M: 8, year: year.firstPart, hour: 0, minute: 0, second: 0}),
      end: moment().set({date: 25, M: 11, year: year.firstPart, hour: 23, minute: 59, second: 59})
    },
    {
      name: '2tr',
      start: moment().set({date: 26, M: 11, year: year.firstPart, hour: 0, minute: 0, second: 0}),
      end: moment().set({date: 1, M: 2, year: year.secondPart, hour: 23, minute: 59, second: 59})
    },
    {
      name: '3tr',
      start: moment().set({date: 2, M: 2, year: year.secondPart, hour: 0, minute: 0, second: 0}),
      end: moment().set({date: 30, M: 7, year: year.secondPart, hour: 23, minute: 59, second: 59}),
    },
  ];
}

/**
 * Split year in trimesters
 *
 * @return {Moment} creationTime
 * @return {Maybe<Object>}
 */
export function getTrimester(creationTime) {
  const trimesters = buildTrimesters(creationTime);

  return _.find(trimesters, function(trimester) {
    return creationTime.isBetween(trimester.start, trimester.end)
  });
}
