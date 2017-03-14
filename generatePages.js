/*eslint-env node*/
/*eslint no-console:0*/

var fs = require('fs'),
  data = require('./data.js'),
  htmlFiles = require('./htmlFilesToObject.js')(),
  handlebars = require('Handlebars'),
  topicsPage, practicesPage, i = 0,
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
    i++;
    console.log("Wrote page " + i + "/208");
    data.topics.forEach(function (topic) {
      //Generate the practice page
      practicesPage = generatePage(level, subject, topic);

      //Write the practicesPage
      fs.writeFileSync(location + '/' + small(level) + "_" + small(subject) + "_" + small(topic) + '.html', practicesPage);
      i++;
      console.log("Wrote page " + i + "/208");
    })
  })
})
