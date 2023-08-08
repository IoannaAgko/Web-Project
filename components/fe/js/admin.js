async function BasicInf(){
    var ctx = document.getElementById('myChart').getContext('2d');
    let response = await fetch("/api/users/totalstats",
    {
        method: "GET",
        credentials: "include"

    })
    const result = await response.json();
    let newColors = function() {
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        return "rgb(" + r + "," + g + "," + b + ")";
    };
    let BarChart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'horizontalBar',

        // The data for our dataset
        data: {
            labels: ['Total Visits', 'Covid Cases', 'Visits from cases'],
            datasets: [{
                //label: 'Visits - Cases - Infected Visits',

                data: [Number(result.data.totalVisits),
                    Number(result.data.totalCases), Number(result.data.visitsFromCases)
                ],
                fill: false,
                backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(255, 159, 64, 0.2)", "rgba(255, 205, 86, 0.2)"],
                borderColor: ["rgb(255, 99, 132)", "rgb(255, 159, 64)", "rgb(255, 205, 86)"],
                borderWidth: 1
            },
        ]
        },
        options: { "scales": { "xAxes": [{ "ticks": { "beginAtZero": true, "precision": 0, "fontColor": "white" } }], "yAxes": [{"ticks": {"fontColor": "white"}}] },
            legend: {
              display: false
            }
          }
    })

    $('#visitTable').DataTable({
        order: [[2, 'desc']],
    });
    let tableData = $('#visitTable').DataTable();
    for (let x of result.data.poisCategVisits){
        tableData.row.add([x.name,x.address, x.number_visits]).draw();
    }
    let caseTable = $('#caseTable').DataTable({
        order: [[2, 'desc']],
    });

    for (let x of result.data.poisCategVisitsFromCases){
        caseTable.row.add([x.name,x.address, x.number_visits]).draw();
    }
        
}

window.onload = BasicInf();