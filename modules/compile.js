/*eslint-env browser*/
var context = {
  header: "<header>header</header>",
  footer: "<footer>footer</footer>"
}

function buildPage(pageId) {
  /*Standard Head Tag*/
  var head = new XMLHttpRequest();
  head.open("GET", "head.html");
  head.onload = function (e) {
    if (head.status == 200) {
      var headString = (this.response);
      document.querySelector("head").innerHTML += headString;
    } else {
      console.log(e);
    }
  }
  head.send();

  /*Standard Header*/
  var header = new XMLHttpRequest();
  header.open("GET", "header.html");
  header.onload = function (e) {
    if (header.status == 200) {
      var headerString = (this.response);
      document.querySelector(".center").insertAdjacentHTML('afterbegin', headerString);
    } else {
      console.log(e);
    }
  }
  header.send();

  var awards = new XMLHttpRequest();
  awards.open("GET", "awards.html");
  awards.onload = function (e) {
    if (awards.status == 200) {
      var awardsString = (this.response);
      document.querySelector("#awards").innerHTML += awardsString;
    } else {
      console.log(e);
    }
  }
  awards.send();

}

buildPage(document.querySelector('body').id)
  /*
  var homeTemplate = document.getElementById('homeTemplate');
  var homeScript = Handlebars.compile(homeTemplate);
  var homeHtml = homeScript(context);
  var homeNode = document.createElement('div');
  console.log(homeNode);
  homeNode.innerHTML = (homeHtml);
  document.querySelector('body').appendChild(homeNode);*/
