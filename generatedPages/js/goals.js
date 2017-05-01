/*eslint-env browser*/
/*eslint no-unused-vars:0*/


function getGoals() {
    var goals = localStorage.getItem('goals');
    if (goals != null) {
        document.getElementById('goals').value = goals;
    } else {
        document.getElementById('goals').value = "MY GOALS";
    }
}

function resetAnimation() {
    document.getElementById('updateMessage').style.animation = "";
}


function updateGoals() {
    var textarea = document.getElementById('goals');
    var goals = textarea.value;
    localStorage.setItem('goals', goals);

    //make sure it worked
    if (localStorage.getItem('goals') === document.getElementById('goals').value) {
        //run animation
        var message = document.getElementById('updateMessage');
        message.style.animation = "fadeMessage 3s";
        //reset animation
        message.addEventListener('animationend', resetAnimation, false);
    }

}
