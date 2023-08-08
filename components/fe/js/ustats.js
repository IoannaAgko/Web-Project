async function ustats(){
    let response = await fetch("/api/users/stats",
    {
        method: "GET",
        credentials: "include"

    })
    const userStats = await response.json();

    let responseTrace = await fetch("/api/users/trace",
    {
        method: "GET",
        credentials: "include"

    })
    const contactTrace = await responseTrace.json();

    $('#traceTable').DataTable({
        order: [[2, 'desc']],
    });
    let tableData = $('#traceTable').DataTable();
    for (let x of contactTrace.data){
        tableData.row.add([x.poi_name,x.address, new Date(x.visit_date).toLocaleString()]).draw();
    }

    $('#infectionTable').DataTable({
        order: [[0, 'desc']],
    });
    let infectionTableData = $('#infectionTable').DataTable();
    for (let x of userStats.data.infections){
        infectionTableData.row.add([new Date(x.case_date).toLocaleString()]).draw();
    }

    $('#visitsTable').DataTable({
        order: [[2, 'desc']],
    });
    let visitsTableData = $('#visitsTable').DataTable();
    for (let x of userStats.data.visits){
        visitsTableData.row.add([x.poi_name,x.address, new Date(x.visit_date).toLocaleString()]).draw();
    }
}

window.onload = ustats();