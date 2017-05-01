/*eslint-env node*/
/*eslint no-console:0*/

var fs = require('fs'),
  data = require('./data.js'),
  d3 = require('d3-dsv'),
  htmlFiles = require('./htmlFilesToObject.js')(),
  handlebars = require('Handlebars'),
  practicesPerPage = require('./practicesPerLevel.js'),
  topicsPage, practicesPage, page = 0,
  template, location;
if (typeof (process.argv[2]) == 'undefined') {
  location = 'generatedPages'
} else {
  location = 'devPages'
}

function small(string) {
  if (string == null || string == 'undefined') {
    return ""
  } else {
    return string.replace(/ /g, "").toLowerCase()
  }
}

function levelLink(string) {
  if (string == null || string == 'undefined') {
    return ""
  } else {
    return string.match(/\d+$/)[0];
  }
}

function subjectLink(string) {
  if (string == null || string == 'undefined') {
    return ""
  } else {
    return string.substr(0, 4).toLowerCase();
  }
}

function topicLink(string) {
  if (string == null || string == 'undefined') {
    return ""
  } else {
    return "t" + (data.topics.indexOf(string) + 1);
  }
}

handlebars.registerHelper('generateLinks', function (subject, level, topic, practice) {
  var count = practicesPerPage[topic][subject][level];
  var out = "";
  var url = "";

  function getUrl(i) {
    quizes.forEach(function (quiz) {
      if (quiz.title == subject + " " + level + " - " + topic + " - " + practice + " " + i) {
        url = quiz.mobile_url;
      }
    });
    return url;
  }

  for (var i = 0; i < count; i++) {
    out += '<li id="' + small(level) + '_' + small(subject) + '_' + small(topic) + '_psg1" class="reset ' + small(subject) + ' passage"><a href="' + new handlebars.SafeString(getUrl(i + 1)) + '" target="_blank"></a> </li>\n';
  }

  return new handlebars.SafeString(out);
});

var quizes = d3.csvParse(fs.readFileSync('quizes.csv', 'utf8'));
handlebars.registerHelper('getUrl', function (subject, level, topic, practice) {
  var url = "";
  quizes.forEach(function (quiz) {
    if (quiz.title == subject + " " + level + " - " + topic + " - " + practice) {
      url = quiz.mobile_url;
    }
  });
  return new handlebars.SafeString(url);
});

function generatePage(level, subject, topic) {
  var context = {
    "level": level,
    "subject": subject,
    "topic": topic,
    "levelsmall": small(level),
    "subjectsmall": small(subject),
    "topicsmall": small(topic),
    "linklevel": levelLink(level),
    "linksubject": subjectLink(subject),
    "linktopic": topicLink(topic)
  }

  if (topic != null) {
    template = handlebars.compile(htmlFiles.practicesTemplate);
    return template(context)
  } else {
    template = handlebars.compile(htmlFiles.topicsTemplate);
    return template(context)
  }
}

data.levels.forEach(function (level) {
  data.subjects.forEach(function (subject) {
    //Generate the topics page
    topicsPage = generatePage(level, subject);

    //Write the topicsPage
    fs.writeFileSync(location + '/' + small(level) + "_" + small(subject) + '.html', topicsPage);
    page++;
    console.log("Wrote page " + page + "/208");
    data.topics.forEach(function (topic) {
      //Generate the practice page
      practicesPage = generatePage(level, subject, topic);

      //Write the practicesPage
      fs.writeFileSync(location + '/' + small(level) + "_" + small(subject) + "_" + small(topic) + '.html', practicesPage);
      page++;
      console.log("Wrote page " + page + "/208");
    })
  })
})
