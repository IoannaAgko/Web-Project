let materialPicker001 = new MaterialDatepicker('#materialpicker001',{
    color: "#7b1fa2",
    onNewDate: function() {
        this.date.setDate(this.date.getDate() + 1);//quick fix for toisostring issue
        createChart(this.date.toISOString().split('T')[0]);
      },
      onLoad: function (date) {
        this.date.setDate(this.date.getDate() + 1);
        createChart(this.date.toISOString().split('T')[0]);
      },
});

async function createChart(date){
    let ctx = document.getElementById('myChart').getContext('2d');
    let response = await fetch("/api/users/visitsperhour?date=" + date,
    {
        method: "GET",
        credentials: "include"

    })
    let responseJson = await response.json();
    let data = responseJson.data;
    let hoursVisits = Object.keys(data.visitsPerHour).map(x => x);
    let numberVisits = Object.keys(data.visitsPerHour).map(x => data.visitsPerHour[x]);
    let numberInfectedVisits = Object.keys(data.infectedVisitsPerHour).map(x => data.infectedVisitsPerHour[x]);
    var config = {
        type: 'line',
        data: {
            labels: hoursVisits,
            datasets: [{
                label: 'Visits',
                data: numberVisits,
                fill: false,
                backgroundColor: "white",   
                borderColor: "white"
            },
            {
                label: 'Visits from Cases',
                data: numberInfectedVisits,
                fill: false,
                backgroundColor: "#7b1fa2",
                borderColor: "#7b1fa2"
            }
        ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Chart.js Line Chart'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                x: {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Hours'
                    }
                },
                y: {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Visits'
                    }
                },
                yAxes: [{ "ticks": { "beginAtZero": true,"precision": 0, "fontColor": "white" } }]
            }
        }
    };
    window.myBar = new Chart(ctx, config);
    if(window.myBar != null){
        window.myBar.update();
    }
}