/* eslint-env browser */
/* eslint no-unused-vars: 0 */
/* eslint no-console: 0 */

var subjects = ["reading", "writing", "speaking", "listening"],
  levels = ["level1", "level2", "level3", "level4"],
  topics = [
  "dailyLife",
  "workAndProfessionalCommunications",
  "personalFinance",
  "humanities",
  "newsAndEvents",
  "yourEnvironment",
  "goalsAndChallenges",
  "socialCommunications",
  "family",
  "recreationAndTravel",
  "education",
  "ethicsAndValues"
  ];

/* OU number required for LTI Request */
var refer = top.location.pathname.split('/');
var ou = refer[refer.length - 1];

/*hide D2L */
top.document.getElementsByTagName("header")[0].style = "display: none;";

/* Toggle Functions */

function togglePreview() {
  toggle('overlay');
  var overlay = document.getElementById('overlay');
  if (overlay.style['zIndex'] == 1) {
    overlay.style = "z-index: -1";
  } else {
    overlay.style = "z-index: 1";
  }
}

function toggleThis(eleId) {
  toggle(eleId);
  toggle('overlay');
}

function toggle(eleId) {
  var target = document.getElementById(eleId);
  target.classList.toggle('hidden');
  target.classList.toggle('visible');
}

function changeFocus(eleId) {
  var pages = document.querySelectorAll('.page');
  pages.forEach(function (page) {
    page.classList.remove('focus');
  })
  var target = document.getElementById(eleId);
  target.classList.add('focus');
}

function toggleFullscreen(eleId) {
  var ele = document.getElementById(eleId);
  ele.classList.toggle('fullscreen');
}

/* Data Operations */
var numMastered = {
  level1: 20,
  level2: 26,
  level3: 19,
  level4: 11
}

function changePerc(percObj) {
  var subjects = document.querySelectorAll('.progress');
  var asPerc = {};
  Object.keys(numMastered).map(function (each) {
    asPerc[each] = (Math.round(numMastered[each] / 32 * 100) + '%');
  });
  subjects.forEach(function (subject) {
    subject.children[1].style = 'width: calc((100% - 161px) *' + numMastered[subject.id] / 32;
    subject.children[0].children[0].innerText = numMastered[subject.id];
    subject.children[0].children[1].innerText = asPerc[subject.id];
  }, numMastered, asPerc);
}

/* ---- Grade info ---- */
/*get grade values*/

function colorHomeTiles(gradeValues) {
  gradeValues.forEach(function (value) {
    var tile = document.getElementById(value.Name);
    var color = tile.querySelector('.color');
    var whichColor;
    if (value.Earned / value.Poss >= .6) {
      whichColor = 'blue';
    } else if (value.Earned / value.Poss > 0) {
      whichColor = 'yellow'
    } else {
      whichColor = 'green';
    }
    color.setAttribute('class', 'color ' + whichColor);
  })
}

function colorTopicTiles(gradeValues) {
  for (var value in gradeValues) {
    var tile = document.getElementById(gradeValues[value].Name);
    var color = tile.querySelector('.color');
    var whichColor;
    if (gradeValues[value].Sum == 11) {
      whichColor = 'blue';
    } else if (gradeValues[value].Sum > 0) {
      whichColor = 'yellow';
    } else {
      whichColor = 'green';
    }
    color.setAttribute('class', 'color ' + whichColor);
  }
}

function colorPracTiles(gradeValues) {
  gradeValues.forEach(function (value) {
    var button = document.querySelector('[id*="psg' + value.Name.split('_')[3] + '"]');
    var whichColor;
    if (value.Earned == 1) {
      whichColor = 'blue';
    } else if (value.Earned == 0) {
      whichColor = 'yellow';
    } else {
      whichColor = 'green';
    }
    if (button.tagName == "A") {
      button.setAttribute('class', 'button step ' + whichColor);
    } else {
      button.setAttribute('class', 'reset ' + whichColor);
    }
  })
}

function controller() {
  var gradeValues = JSON.parse(localStorage["grade-values"]);
  var filteredGrades = []

  var pageId = document.querySelector('body').id;

  if (pageId == 'home') {
    getProfileInfo()
    filteredGrades = gradeValues.filter(function (value) {
      return value.Type == 5;
    });
    colorHomeTiles(filteredGrades);
    changePerc(numMastered);
  } else if (pageId.length > 16) {
    var pracGrades = gradeValues.filter(function (value) {
      return value.Type == 2 && value.Name.toLowerCase().includes(pageId);
    })
    var readyGrades = [];
    for (var i = 0; i < pracGrades.length; i++) {
      readyGrades[i] = {
        Name: pageId + "_" + (i + 1),
        Earned: pracGrades[i].Earned
      }
    }
    colorPracTiles(readyGrades);
  } else {
    var levelGrades = gradeValues.filter(function (value) {
      return value.Type == 2 && value.Name.includes(pageId);
    })
    var topicGrades = [];
    topics.forEach(function (topic) {
      topicGrades[topic] = {
        Sum: 0,
        Name: pageId + "_" + topic.toLowerCase()
      };
    });
    levelGrades.forEach(function (grade) {
      var topic = grade.Name.split('_')[2];
      topicGrades[topic].Sum += grade.Earned;
    });
    colorTopicTiles(topicGrades);
  }
}
/* Get Grade values */

function getGradeValues() {

  var item = new XMLHttpRequest();
  item.open("GET", "/d2l/api/le/1.15/" + ou + "/grades/values/myGradeValues/");
  item.onload = function (e) {
    if (item.status == 200) {
      var response = JSON.parse(item.response);
      var gradeValues = [];
      gradeValues.push({
        "userId": localStorage["Session.UserId"]
      });
      response.forEach(function (grade) {
        gradeValues.push({
          Name: grade.GradeObjectName,
          Id: grade.GradeObjectIdentifier,
          Earned: grade.PointsNumerator,
          Poss: grade.PointsDenominator,
          Type: grade.GradeObjectType,
        })
      });
      localStorage["grade-values"] = JSON.stringify(gradeValues);
      controller();
    } else {
      console.log(e);
    }
  }
  item.send();
}

/* clear grade values if user is not the same */
if (localStorage.getItem("grade-values") === null) {
  getGradeValues();
} else {
  if (JSON.parse(localStorage["grade-values"]["userId"] != localStorage["Session.UserId"])) {
    localStorage.removeItem('gradeValues');
    getGradeValues();
  } else {
    controller();
  }
}
/* --- Page Content --- */

function getProfileInfo() {

  function resizeText() {
    var text = document.getElementById('name');
    if (text.innerText.length > 30) {
      text.style = "font-size:1em";
    }
  }

  /* Student Data */
  var profile = new XMLHttpRequest();
  profile.open("GET", "/d2l/api/lp/1.15/profile/myProfile");
  profile.onload = function (e) {
    if (profile.status == 200) {
      var profileData = JSON.parse(profile.response);
      var user = new XMLHttpRequest();
      user.open("GET", "/d2l/api/lp/1.15/users/whoami");
      user.onload = function (e) {
        if (user.status == 200) {
          var userData = JSON.parse(user.response);
          document.getElementById('name').innerText = userData.FirstName + userData.LastName;
          if (profileData.HomeTown != null) {
            document.getElementById('gatheringLocation').innerText = 'Hometown: ' + profileData.HomeTown;
          }
          resizeText();
        } else {
          console.log(e);
          resizeText();
        }
      }
      user.send();
    } else {
      console.log(e);
      resizeText();
    }
  }
  profile.send();

  /* Profile Picture */
  var image = new XMLHttpRequest();
  image.open("GET", "/d2l/api/lp/1.15/profile/myProfile/image");
  image.responseType = "blob";
  image.onload = function (e) {
    if (image.status == 200) {
      var urlCreator = window.URL;
      var imageUrl = urlCreator.createObjectURL(this.response);
      document.querySelector("#profilePic").src = imageUrl;
    } else {
      console.log(e);
    }
  }
  image.send();
}

/* Awards HTML */
var awards = new XMLHttpRequest();
awards.open("GET", "awards.html");
awards.onload = function (e) {
  if (awards.status == 200) {
    document.getElementById('awards').innerHTML = awards.response;
  } else {
    console.log(e)
  }
}
if (document.getElementById('awards')) {
  awards.send();
}

function ECIlti(vars) {
  var query = '';
  console.log(window.location.pathname);

  for (var key in vars) {
    if (query.length == 0) {
      query += '?' + key + '=' + encodeURIComponent(vars[key]);
    } else {
      query += '&' + key + '=' + encodeURIComponent(vars[key]);
    }
  }
  document.getElementById('learnosity').src = '/d2l/le/lti/' + ou + '/toolLaunch/14/128475061' + query;
}
