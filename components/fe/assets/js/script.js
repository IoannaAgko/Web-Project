const forms = document.querySelector(".forms"),
pwShowHid = document.querySelectorAll(".eye-icon");

console.log(forms, pwShowHid);

pwShowHid.forEach(eyeIcon => {
    eyeIcon.addEventListener("click", ()=>{
        let pwFields = eyeIcon.parentElement.parentElement.querySelectorAll(".password");
        console.log(pwFields)

        pwFields.forEach(password =>{
            if(password.type === "password"){
                password.type = "text";
                eyeIcon.classList.replace("bx-hide", "bx-show");
                return;
            }
            password.type = "password";
            eyeIcon.classList.replace("bx-show", "bx-hide");

        })
    })
})
