const button = document.getElementById('submitCovidCase');
let calendarObject = document.getElementById('effective-date')
calendarObject.value = new Date().toISOString().split('T')[0];
button.addEventListener('click', async function handleClick() {
    let date = document.getElementById("effective-date").value;


    let response = await fetch("/api/users/case?date=" + date,
    {
        method: "POST",
        credentials: "include",
        headers: {'Content-Type': 'application/json'},
        

    })
    if(response.status == 200){
        alert("Infection registered")
    }
    if(response.status == 409){
        alert("You have already registered your infection")
    }

});