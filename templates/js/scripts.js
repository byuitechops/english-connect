/* eslint-env browser */
/* eslint no-unused-vars: 0 */
/* eslint no-console: 0 */

if (top.location != self.location) {
  top.location = self.location.href;
  document.querySelector('body > div > div.d2l-popup-title').style = "display:none";
}

function togglePreview() {
  toggle('overlay');
  var button = document.querySelector('#courseInfo h2');
  if (button.style['zIndex'] == 2) {
    button.style = "z-index: 0";
  } else {
    button.style = "z-index: 2";
  }
}

function toggleThis(eleId) {
  toggle(eleId);
  toggle('overlay');
}

function toggle(eleId) {
  var target = document.querySelector('#' + eleId);
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

function resizeText() {
  var text = document.getElementById('name');
  if (text.innerText.length > 30) {
    text.style = "font-size:1em";
  }
}

var image = new XMLHttpRequest();
image.open("GET", "https://pathway.brightspace.com/d2l/api/lp/1.15/profile/myProfile/image");
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

var profile = new XMLHttpRequest();
profile.open("GET", "https://pathway.brightspace.com/d2l/api/lp/1.15/profile/myProfile");
profile.onload = function (e) {
  if (profile.status == 200) {
    var profileData = JSON.parse(profile.response);
    //UserData
    var user = new XMLHttpRequest();
    user.open("GET", "https://pathway.brightspace.com/d2l/api/lp/1.15/users/whoami");
    user.onload = function (e) {
      if (user.status == 200) {
        var userData = JSON.parse(user.response);
        document.getElementById('name').innerText = userData.FirstName + userData.LastName;
        if (profileData.HomeTown != null) {
          document.getElementById('gatheringLocation').innerText = 'Gathering Location: ' + profileData.HomeTown;
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

changePerc(numMastered);
