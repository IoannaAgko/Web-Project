async function upload() {
    let input = document.getElementById('myFile')
    let data = new FormData()
    data.append('pois', input.files[0])
    data.append('modifDate', input.files[0].lastModifiedDate)
    let response = await fetch('/api/pois/upload', {
        method: 'POST',
        credentials: "include",
        body: data
    })

    if(response.status == 200){
        alert("POIs upload completed successfully")
    }
}

async function deletePOIs(){
    let confirmation = window.confirm("Are you sure you want to delete POIs? All POIs and visit data will be lost")
    if(confirmation){
        let response = await fetch("/api/pois",
        {
            method: "DELETE",
            credentials: "include"
            
    
        })
        if(response.status == 200){
            alert("POIS deleted")
        }
    }


}