// const button = document.getElementById('submitEditProfile');
// button.addEventListener('click', async function handleClick() {
//     let username = document.getElementById("username-user").value;
//     let password = document.getElementById("password-user").value;
//     let profileObj = {
//         username: username,
//         pass: password
//     }
//     console.log('element clicked'); 
//     let response = await fetch("/api/users/edit",
//         {
//             method: "POST",
//             credentials: "include",
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify(profileObj)

//         })
//         if(response.status == 200){
//             window.location.href = 'dashboard'
//         }
// });

function password_matching() {
    var password = document.getElementById('pwd');
    var password_cf = document.getElementById('pwd_cf');
    if (password.value != password_cf.value) {
        password_cf.setCustomValidity('You must put the same password.');
        return false;

    } else {
        password_cf.setCustomValidity('');
        return true;
    }
}


var error_exists = false;
var submited = false;


function post_it() {


    if (submited) {

        $('#username').removeClass('valid_hate');
        $('#username').removeClass('invalid_love'); // add the error class to show red input
        $('#error1').remove();
        $('#error2').remove();

        var formData = {
            'username': $('input[name=username]').val(),
            'pass': $('input[name=password]').val()
        };

        // process the form
        $.ajax({
            type: 'POST',
            url: '/api/users/edit',
            data: formData,
            dataType: 'json',
            encode: true,
            success: function (xhr) {

                location.href = '/dashboard'
            },
            error: function (xhr, status, error) {
                var res = JSON.parse(xhr.responseText);
                error_exists = true;
                $('form').removeClass('was-validated');
                // var count = res.keys(res).length;

                if (res.user === true && res.email === false) {

                    $('#username').removeClass('valid_hate');
                    $('#username').addClass('invalid_love');
                    $('#name-group').append('<div id="error1" class="love_yes"> Username is used. Choose another </div>');


                } else {

                    $('#username').removeClass('valid_hate');
                    $('#username').addClass('invalid_love');
                    $('#name-group').append('<div id="error1" class="love_yes"> Username is already in use. Choose another </div>');

                }
            }
        })
    }


}








// document.getElementById('pwd').addEventListener('keyup', check_password);
document.getElementById('pwd_cf').addEventListener('keyup', password_matching);


'use strict';
window.addEventListener('load', function() {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    var inputs = document.getElementsByClassName('input form-control');
    var check = true;

    const username = document.getElementById('username');
    const password = document.getElementById('pwd');
    const password_cf = document.getElementById('pwd_cf');
    const nice = document.getElementById('nice');


    username.addEventListener('keyup', function() {
        if (check === true && error_exists === true) {
            username.classList.remove('invalid_love');
            document.getElementById("error").remove();
        }
    });

    password.addEventListener('keyup', function() {
        if (check === true) {
            var val = password.checkValidity();
            if (val !== true) {
                password.classList.add('invalid_love');
                password.classList.remove('valid_hate');
                nice_p.classList.add('love_yes');
                nice_p.classList.remove('love_no');
            } else {
                password.classList.add('valid_hate');
                password.classList.remove('invalid_love');
                nice_p.classList.remove('love_yes');
                nice_p.classList.add('love_no');
            };
        }
    });

    password_cf.addEventListener('keyup', function() {
        if (check === true) {
            var ans = password_matching();
            if (ans !== true) {
                password_cf.classList.add('invalid_love');
                nice_pp.classList.add('love_yes');
                nice_pp.classList.remove('love_no');
                password_cf.classList.remove('valid_hate');
            } else {
                password_cf.classList.add('valid_hate');
                nice_pp.classList.add('love_no');
                nice_pp.classList.remove('love_yes');
                password_cf.classList.remove('invalid_love');
            };

        }
    });


    var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener('submit', function(event) {
            if (form.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                submited = true;
                event.preventDefault();
                event.stopPropagation();
                post_it();
            }
            
            password.classList.remove('valid_hate');
            nice_p.classList.remove('love_yes');
            nice_p.classList.add('love_no');
            password_cf.classList.remove('valid_hate');
            nice_pp.classList.remove('love_yes');
            nice_pp.classList.add('love_no');
            form.classList.add('was-validated');
            check = false;
        }, false);
    });
}, false);