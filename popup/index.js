var TLK;
var TLK_OLD;
var pageInfo;
var processedData;
var baseURL = 'http://app.binding-edu.org/api';
var sessionApi = 'sessions?count=10000&offset=0&search=tlk&student=';
var activitiesApi = 'activities';

// Context scope variable. In template access with context.foo
_.templateSettings.variable = "context";
var sessionsTemplate = _.template(
  $('script.sessions').html()
);

var coursesNames = [
  '1P', '2P', '3P', '4P', '5P', '6P',
  '1ESO', '2ESO', '3ESO', '4ESO',
];

// Read TLK OLD
$.getJSON(chrome.extension.getURL('/data/tlk_old.json'), function(tlk) {
  TLK_OLD= tlk;
});

// Read TLK
$.getJSON(chrome.extension.getURL('/data/tlk.json'), function(tlk) {
  TLK = tlk;
});

var tlkSessionTypes = {
  'TLK 2' : {
    silaba_types: {
      mono: ["ACT 1_N", "ACT 2_N", "ACT 3_N", "ACT4_N"],
      bi: ["ACT 5_N", "ACT 6_N", "ACT 7_N"],
    },
    baremo: TLK_OLD,
  },
  'TLK-2-N' : {
    silaba_types: {
      mono: ["ACT 1_N", "ACT 2_N", "ACT 3_N", "ACT4_N"],
      bi: ["ACT 5_N", "ACT 6_N", "ACT 7_N"],
    },
    baremo: TLK,
  },
  'TLK 2-6' : {
    silaba_types: {
      mono: ["ACT 1_N", "ACT 2_N", "ACT 3_N"],
      bi: ["ACT4_N", "ACT 5_N", "ACT 6_N", "ACT 7_N", "ACT 8_N", "ACT 9_N"],
      tri: ["ACT 10_N", "ACT 11_N", "ACT 12_N"],
    },
    baremo: TLK_OLD,
  },
  'TLK 2-6_N' : {
    silaba_types: {
      mono: ["ACT 1_N", "ACT 2_N", "ACT 3_N"],
      bi: ["ACT4_N", "ACT 5_N", "ACT 6_N", "ACT 7_N", "ACT 8_N", "ACT 9_N"],
      tri: ["ACT 10_N", "ACT 11_N", "ACT 12_N"],
    },
    baremo: TLK,
  },
};

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
 * Split year in trimesters
 *
 * @return {Moment} session_creation
 * @return {String}
 */
function getTrimester(session_creation) {
  var currentYear = session_creation.year();
  var prevYear = currentYear - 1;
  var nextYear = currentYear + 1;
  var startYear = moment().set({date: 1, M: 0, date: 1, year: currentYear, hour: 00, minute: 00, second: 00});
  var middleYear = moment().set({date: 30, M: 7, date: 1, year: currentYear, hour: 23, minute: 59, second: 59});
  var isFirstPartOfYear = session_creation.isBetween(startYear, middleYear);

  var firstPart = isFirstPartOfYear ? prevYear : currentYear;
  var secondPart = isFirstPartOfYear ? currentYear : nextYear;

  var trimesters = [
    {
      name: '1tr',
      start: moment().set({date: 1, M: 8, year: firstPart, hour: 00, minute: 00, second: 00}),
      end: moment().set({date: 25, M: 11, year: firstPart, hour: 23, minute: 59, second: 59})
    },
    {
      name: '2tr',
      start: moment().set({date: 26, M: 11, year: firstPart, hour: 00, minute: 00, second: 00}),
      end: moment().set({date: 1, M: 2, year: secondPart, hour: 23, minute: 59, second: 59})
    },
    {
      name: '3tr',
      start: moment().set({date: 2, M: 2, year: secondPart, hour: 00, minute: 00, second: 00}),
      end: moment().set({date: 30, M: 7, year: secondPart, hour: 23, minute: 59, second: 59}),
    }
  ];

  var trimester = _.find(trimesters, function(trimester) {
    return session_creation.isBetween(trimester.start, trimester.end)
  });

  return trimester.name;
}

/**
 * Process data from server. Adding trimester information
 * to each session
 *
 * @return {Objec} data
 * @return {Object}
 */
function processData(data) {
  var activitiesBySessionID = _.groupBy(data.activities, 'session');
  var sessionsWithTrimester = _.map(data.valid_sessions, function(session) {
    var creationTime = moment(session.creation_time);

    session.creationTime = creationTime;
    session.trimester = getTrimester(creationTime);
    return session;
  });

  var sessionsOrdered = _.sortBy(sessionsWithTrimester, function(session) {
    return session.creationTime.unix();
  });

  return {
    sessions: sessionsOrdered,
    activitiesBySessionID: activitiesBySessionID
  };
}

$('.js-calculate').click(function () {
  $(this).text('calculando...');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var currentTab = tabs[0];

    fetchData(pageInfo.token, currentTab.url, function (data) {
      processedData = processData(data);

      $('.js-user-input').html(
        sessionsTemplate({
          sessions: processedData.sessions,
          courses: coursesNames
        })
      );

    });
  });
});



