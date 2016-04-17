var TLK_LIST = {};
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

var percentilsTemplate = _.template(
  $('script.percentils').html()
);

var coursesNames = [
  '1P', '2P', '3P', '4P', '5P', '6P',
  '1ESO', '2ESO', '3ESO', '4ESO',
];

// Read TLK OLD
$.getJSON(chrome.extension.getURL('/data/tlk_old.json'), function(tlk) {
  TLK_LIST['TLK_OLD'] = tlk;
});

// Read TLK
$.getJSON(chrome.extension.getURL('/data/tlk.json'), function(tlk) {
  TLK_LIST['TLK'] = tlk;
});

var tlkSessionTypes = {
  'TLK 2' : {
    silaba_types: {
      mono: ["ACT 1", "ACT 2", "ACT 3", "ACT4"],
      bi: ["ACT 5_N", "ACT 6_N", "ACT 7_N"],
    },
    tlk_key: 'TLK_OLD'
  },
  'TLK 2-6' : {
    silaba_types: {
      mono: ["ACT 1", "ACT 2", "ACT 3"],
      bi: ["ACT4", "ACT 5", "ACT 6", "ACT 7", "ACT 8", "ACT 9"],
      tri: ["ACT 10", "ACT 11", "ACT 12"],
    },
    tlk_key: 'TLK_OLD'
  },
  'TLK-2-N' : {
    silaba_types: {
      mono: ["ACT 1_N", "ACT 2_N", "ACT 3_N", "ACT4_N"],
      bi: ["ACT 5_N", "ACT 6_N", "ACT 7_N"],
    },
    tlk_key: 'TLK'
  },
  'TLK 2-6_N' : {
    silaba_types: {
      mono: ["ACT 1_N", "ACT 2_N", "ACT 3_N"],
      bi: ["ACT4_N", "ACT 5_N", "ACT 6_N", "ACT 7_N", "ACT 8_N", "ACT 9_N"],
      tri: ["ACT 10_N", "ACT 11_N", "ACT 12_N"],
    },
    tlk_key: 'TLK'
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
 * Get course with session ID from user input
 *
 * @return {Array}
 */
function getCourses() {
  var sessionsHtml = $('.js-sessions-with-courses li');
  var selectedCoursesOptions = sessionsHtml.find('.js-select').find(':selected');

  return _.map(selectedCoursesOptions, function(option) {
    var value = $(option).val();
    var match = value.match(/(\d+):(\w+)/);
    return {
      sessionId: match[1],
      course: match[2]
    };
  });
}

/**
 * Add courses to sessions
 *
 * @param {Array} courses
 */
function addCoursesToSessions(courses) {
  _.each(courses, function(courseInfo) {
    processedData.sessionsByID[courseInfo.sessionId].course = courseInfo.course;
  });
}

/**
 * Get media of an array of numbers
 *
 * @param {Array} values
 * @return {Number}
 */
function getMedia(values) {
  var count = values.length;
  var sum = _.reduce(values, function(memo, num){
    return memo + (+num);
  }, 0);
  return sum / count;
}

/**
 * Get percentil for that tlk session and activities media
 *
 * @param {Object} tlk
 * @param {Number} media
 * @return {Object}
 */
function getPercentil(tlk, media) {
  // remove keys that are not percentils like course, trimester,...
  var validTlkValues = _.reduce(tlk, function(memo, value, key) {
    if (/^p\d+$/.test(key)) {
      var num = value.replace(',', '.');
      memo[key] = parseFloat(num);
    }
    return memo
  }, {});

  var prevValue = {};
  var winner_percentil = {};
  var percentil = _.find(validTlkValues, function(value, key) {
    if (prevValue && (prevValue.value <= media && media < value)) {
      winner_percentil = {
        key: prevValue.key,
        value: prevValue.value
      };

      return true;
    }

    prevValue = {
      key: key,
      value: value
    };
  });

  return winner_percentil;
}

/**
 * Generate percentils taking into account specific TLK
 * Based on session name it can be TLK or TLK_OLD baremos
 *
 * @return {Array}
 */
function generatePercentils() {
  return _.map(_.values(processedData.sessionsByID), function (session) {
    var sessionMeta = tlkSessionTypes[session.name];
    var tlk = TLK_LIST[sessionMeta.tlk_key];
    var tlkValidSessions = _.filter(tlk, function (row) {
      return row.trimester === session.trimester && row.course === session.course;
    });
    var tlkBySilabaType = _.groupBy(tlkValidSessions, 'length');
    var activities = _.map(processedData.activitiesBySessionID[session.id]);
    var activitiesBySilabaType = _.groupBy(activities, function(activity) {
      var silabas = sessionMeta.silaba_types;
      return _.find(_.keys(silabas), function(key) {
        return _.contains(silabas[key], activity.name);
      });
    });

    // TODO: Could be activities with NOT standard names
    // Those are grouped under undefined key
    if (activitiesBySilabaType.undefined) {
      delete activitiesBySilabaType.undefined;
    }

    var percentils = _.reduce(_.keys(activitiesBySilabaType), function(memo, type) {
      var activities = activitiesBySilabaType[type];
      var activities_words_minute = _.pluck(activities, 'words_minute');
      var media = getMedia(activities_words_minute);
      var tlk_activities = tlkBySilabaType[type][0];

      memo[type] = {
        activities_media: media,
        tlk_percentil: getPercentil(tlk_activities, media)
      }

      return memo;
    }, {});

    session.percentils = percentils;
    return session;
  });
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

  var sessionsByID = _.indexBy(sessionsOrdered, 'id');

  return {
    sessionsByID: sessionsByID,
    activitiesBySessionID: activitiesBySessionID
  };
}

$('.js-calculate').click(function () {
  $(this).text('calculando...');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var currentTab = tabs[0];

    // Get sessions and activities from API
    fetchData(pageInfo.token, currentTab.url, function (data) {
      processedData = processData(data);

      // We do not have course info on session.
      // We need to ask user to select course for each session
      $('.js-user-input').html(
        sessionsTemplate({
          sessions: _.values(processedData.sessionsByID),
          courses: coursesNames
        })
      );

      $('.js-calculate-with-course').on('click', function () {
        var courses = getCourses();
        var notSelectedCourse = _.any(courses, function (o) {return o.course === 'no';});

        if (notSelectedCourse) {
          $('.js-error').text('Debes seleccionar un curso para cada session');
        } else {
          addCoursesToSessions(courses);
          var sessionsWithPercentils = generatePercentils();

          $('.js-user-input').html(
            percentilsTemplate({
              sessions: sessionsWithPercentils,
            })
          );
        }
      });

    });
  });
});

