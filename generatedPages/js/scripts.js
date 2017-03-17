/* eslint-env browser */
/* eslint no-unused-vars: 0 */
/* eslint no-console: 0 */

var subjects = ["reading", "writing", "speaking", "listening"],
  levels = ["level1", "level2", "level3", "level4"],
  topics = [
  "dailylife",
  "workandprofessionalcommunications",
  "personalfinance",
  "humanities",
  "newsandevents",
  "yourenvironment",
  "goalsandchallenges",
  "socialcommunications",
  "family",
  "recreationandtravel",
  "education",
  "ethicsandvalues"
  ],
  passages = ["psg1", "psg2", "psg3", "psg4", "psg5", "psg6", "psg7", "psg8", "psg9", "psg10", "psg11"];

/* OU n
mastered: 0,umber required for LTI Request */
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

/* ---- Grade info ---- */

function color(eleId, color) {
  var ele = document.getElementById(eleId);
  ele.classList.toggle('green');
  ele.classList.toggle(color);
}

function homeOps(grades) {
  getProfileInfo()
    // poulate the tiles by querying grades obj
  var tiles = document.querySelectorAll('.color');
  tiles.forEach(function (tile) {
    var path = tile.id.split('_');
    if (grades[path[0]][path[1]]["mastered"] >= 8) {
      color(tile.id, 'blue');
    } else if (grades[path[0]][path[1]]["total"] != null) {
      color(tile.id, 'yellow')
    }
  });
  // move the progress bars and change the percentages
  var levels = document.querySelectorAll('.progress');
  levels.forEach(function (level) {
    level.children[0].children[0].innerText = grades[level.id]["total"];
    level.children[0].children[1].innerText = Math.round(grades[level.id]["total"] / 32 * 100);
    level.children[1].style = 'width: calc((100% - 161px) *' + grades[level.id]["total"] / 32;
  })
}

function topicOps(grades) {
  var tiles = document.querySelectorAll('.color');
  tiles.forEach(function (tile) {
    var path = tile.id.split('_')
    if (grades[path[0]][path[1]][path[2]]["psg11"] == 1) {
      color(tile.id, 'blue');
    } else if (grades[path[0]][path[1]][path[2]]["total"] != null) {
      color(tile.id, 'yellow')
    }
  });
  var level = document.querySelector('.progress');
  var path = level.id.split('_');
  level.children[0].children[0].innerText = grades[path[0]][path[1]]["mastered"];
  level.children[0].children[1].innerText = Math.round(grades[path[0]][path[1]]["mastered"] / 12 * 100);
  level.children[1].style = 'width: calc((100% - 161px) *' + grades[path[0]][path[1]]["mastered"] / 12;
}

function pracOps(grades) {
  var buttons = document.querySelectorAll('.passage');
  buttons.forEach(function (button) {
    var path = button.id.split('_')
    if (grades[path[0]][path[1]][path[2]][path[3]] == 1) {
      color(button.id, 'blue');
    } else if (grades[path[0]][path[1]][path[2]]["total"] != null) {
      color(button.id, 'yellow')
    }
  });
}

function controller() {
  var grades = JSON.parse(localStorage["grades-obj"]);
  var pageId = document.querySelector('body').id;

  if (pageId == 'home') {
    homeOps(grades);
  } else if (pageId.length > 16) {
    pracOps(grades, pageId);
  } else {
    topicOps(grades, pageId)
  }
}
/* Get Grade values */

function getGradeValues() {
  var item = new XMLHttpRequest();
  item.open("GET", "/d2l/api/le/1.15/" + ou + "/grades/values/myGradeValues/");
  item.onload = function (e) {
    if (item.status == 200) {
      var response = JSON.parse(item.response);
      localStorage.setItem("last-updated", JSON.stringify([
        localStorage["Session.UserId"],
        new Date().getTime()
      ]));
      var filtered = response.filter(function (value) {
        return value.GradeObjectType == 2;
      });
      // Populate grades obj
      filtered.forEach(function (grade) {
        var location = grade.GradeObjectName.toLowerCase().split('_');
        grades[location[0]][location[1]][location[2]][location[3]] = grade.PointsNumerator;
      });
      levels.forEach(function (level) {
        subjects.forEach(function (subject) {
          topics.forEach(function (topic) {
            passages.forEach(function (psg) {
              var psgVal = grades[level][subject][topic][psg];
              if (psgVal != null) {
                grades[level][subject][topic]["total"] += psgVal;
                grades[level][subject]["total"] += psgVal;
              }
            });
            if (grades[level][subject][topic]["psg11"] == 1) {
              grades[level][subject]["mastered"] += 1;
              grades[level]["total"] += 1;
            }
          })
        })
      })
      localStorage["grades-obj"] = JSON.stringify(grades);
      controller();
    } else {
      console.log(e);
    }
  }
  item.send();
}

/* clear grade values if user is not the same */
if (localStorage.getItem("grades-obj") === null) {
  getGradeValues();
} else {
  var lastUpdated = JSON.parse(localStorage["last-updated"]);
  if (lastUpdated[0] != localStorage["Session.UserId"] || ((new Date().getTime()) - lastUpdated[1]) > 1000 * 60 * 60) {
    localStorage.removeItem('grades-obj');
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
/* To be executed on every page*/
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
