var TLK;
var TLK_OLD;
var pageInfo;
var baseURL = 'http://app.binding-edu.org/api';
var sessionApi = 'sessions?count=10000&offset=0&search=tlk&student=';
var activitiesApi = 'activities';

var first = moment().set({M: 0, date: 1});
var today = moment();
var isAfterXmas = today.isSameOrAfter(first);


var tlkSessionTypes = {
  'TLK 2' : {
    mono: ["ACT 1_N", "ACT 2_N", "ACT 3_N", "ACT4_N"],
    bi: ["ACT 5_N", "ACT 6_N", "ACT 7_N"],
  },
  'TLK-2-N' : {
    mono: ["ACT 1_N", "ACT 2_N", "ACT 3_N", "ACT4_N"],
    bi: ["ACT 5_N", "ACT 6_N", "ACT 7_N"],
  },
  'TLK 2-6' : {
    mono: ["ACT 1_N", "ACT 2_N", "ACT 3_N"],
    bi: ["ACT4_N", "ACT 5_N", "ACT 6_N", "ACT 7_N", "ACT 8_N", "ACT 9_N"],
    tri: ["ACT 10_N", "ACT 11_N", "ACT 12_N"],
  },
  'TLK 2-6_N' : {
    mono: ["ACT 1_N", "ACT 2_N", "ACT 3_N"],
    bi: ["ACT4_N", "ACT 5_N", "ACT 6_N", "ACT 7_N", "ACT 8_N", "ACT 9_N"],
    tri: ["ACT 10_N", "ACT 11_N", "ACT 12_N"],
  },
};

// Read TLK OLD
$.getJSON(chrome.extension.getURL('/data/tlk_old.json'), function(tlk) {
  TLK_OLD= tlk;
});

// Read TLK
$.getJSON(chrome.extension.getURL('/data/tlk.json'), function(tlk) {
  TLK = tlk;
});

// Request info to page with chrome.extension API message
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {type: "request_info"}, function(response) {
    if (response && response.info) {
      pageInfo = response.info;
    }
  });
});

var Promise = function() {
  return $.Deferred.apply(this, arguments);
};

Promise.all = function(promises) {
  var counter = 0;
  var done_results = [];
  var fail_reason;
  var result = new $.Deferred();

  _.each(promises, function(promise) {
    promise
      .done(function(resp) {
        done_results.push(resp);
      })
      .fail(function(reason) {
        if (_.isUndefined(fail_reason)) {
          fail_reason = reason;
        }
      })
      .always(function() {
        counter++;
        if (counter !== promises.length) {
          return;
        }

        if (fail_reason) {
          result.reject(fail_reason);
        } else {
          result.resolve(done_results);
        }
      });
  });

  return result;
};

/**
 * Filter sessions to reject invalid
 *
 * @param {Array}
 * @return {Objec}
 */
function filterSessions(sessions) {
  return _.reduce(sessions, function(memo, session){
    if (_.contains(_.keys(tlkSessionTypes), session.name)) {
      memo.valid.push(session);
    } else {
      memo.invalid.push(session);
    }
    return memo;
  }, {valid: [], invalid: []});
}

/**
 * Make activity AJAX request. Then this is send in a Promise.all
 * to fetch all the activities
 *
 * @param {Integer} activityId
 */
function getActivityAjaxCall(activityId) {
  return $.ajax({
    url: baseURL + '/' + activitiesApi + '/' + activityId,
    headers: {"Token": pageInfo.token},
    method: 'GET',
  });
}

/**
 * Make all AJAX requests to get sessions/activities
 *
 * @param {String} token
 * @param {String} url
 * @param {Function} callback
 */
function fetchData(token, url, callback) {
  var urlMatch = url.match(/\/dashboard\/student\/(\d+)\/summary\/session/);

  if (urlMatch && urlMatch[1]) {
    var studentId = urlMatch[1];
    $.ajax({
      url: baseURL + '/' + sessionApi + studentId,
      headers: {"Token": token},
      method: 'GET',
    }).done(function (data) {
      var sessionsData= JSON.parse(data);
      var sessions = filterSessions(sessionsData.sessions);

      var activitiesAjaxCallList = _.flatten(_.map(sessions.valid, function (session) {
        return _.map(session.list_activities, function (activityId) {
          return getActivityAjaxCall(activityId);
        });
      }));

      Promise.all(activitiesAjaxCallList).done(function (data) {
        activities = _.compact(_.map(data, function(data) {
          var activityData = JSON.parse(data);
          if (!activityData) return null;
          return activityData.activity;
        }));

        callback({
          activities: activities,
          valid_sessions: sessions.valid,
          invalid_sessions: sessions.invalid,
        });
      });
    });
  }
}

/**
 * Get Older and newer session years
 *
 * @param {Array} sessions
 * @return {Object}
 */
function getMaxMinSessionYear() {
  var sessionYears = _.uniq(_.map(sessions, function(session) {
    return moment(session.creation_time).year();
  }));

  return {
    minYear: _.min(sessionYears),
    maxYear: _.max(sessionYears),
  };
}

var initialCourseYear = isAfterXmas ? (today.year() - 1) : today.year();
var endCourseYear = !isAfterXmas ? (today.year() + 1) : today.year();

var trimesters = {
  '1t': {
    start: moment().set({date: 1, M: 8, year: initialCourseYear}),
    end: moment().set({date: 25, M: 11, year: initialCourseYear}),
  },
  '2t': {
    start: moment().set({date: 26, M: 11, year: initialCourseYear}),
    end: moment().set({date: 1, M: 2, year: endCourseYear}),
  },
  '3t': {
    start: moment().set({date: 2, M: 2, year: endCourseYear}),
    end: moment().set({date: 31, M: 6, year: endCourseYear}),
  },
};

$('.js-calculate').click(function () {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var currentTab = tabs[0];
    fetchData(pageInfo.token, currentTab.url, function (data) {

      var activitiesBySessionID = _.groupBy(data.activities, 'session');
      var analizedData = _.reduce(data.valid_sessions, function(memo, session) {
        debugger;
        var publishDate = moment(session.publish_date, 'YYYY-MM-DD');
        sessionSemester = _.filter(trimesters, function(trimester) {
          return publishDate.isBetween(trimester.start, trimester.end)
        });
        console.log('foo', activitiesBySessionID)
        return memo;
      }, {});

      if (data.invalid_sessions.length) {
        var invalidSessions  = [$('<div/>').text('Sessions Invalid:' + data.invalid_sessions.length)];
        _.each(data.invalid_sessions, function(session) {
          invalidSessions.push($('<div/>').text(
            session.name + ': ' + session.id
          ));
        });
        $('.js-result').html(invalidSessions);
      }
    });
  });
});



