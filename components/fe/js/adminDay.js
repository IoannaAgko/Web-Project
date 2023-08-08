let materialPicker002 = new MaterialDatepicker('#materialpicker002',{
    color: "#7b1fa2",
    type: "month",
    onNewDate: function() {
        createChart(this.date)
      },
      onLoad: function (date) {
        this.date = new Date(date.getFullYear(), date.getMonth(), 1);//get first date of month, bug that on load gives current date not month
        createChart(this.date)
      },
});

async function createChart(date){
    let startDate = date;
    startDate.setDate(startDate.getDate() + 1)
    let endDate = new Date(startDate.getFullYear(), startDate.getMonth()+1, 0);//Setting day parameter to 0 means one day less than first day of the month which is last day of the previous month.
    endDate.setDate(endDate.getDate() + 1)
    startDate = startDate.toISOString().split('T')[0] //fix date formatting to post
    endDate = endDate.toISOString().split('T')[0]
    let ctx = document.getElementById('myChart').getContext('2d');
    let response = await fetch("/api/users/visitsperday?startDate=" + startDate + "&endDate=" + endDate,
    {
        method: "GET",
        credentials: "include"

    })
    let responseJson = await response.json();
    let data = responseJson.data;
    let daysVisits = Object.keys(data.visitsPerDay).map(x => x);
    let numberVisits = Object.keys(data.visitsPerDay).map(x => data.visitsPerDay[x]);
    let numberInfectedVisits = Object.keys(data.infectedVisitsPerDay).map(x => data.infectedVisitsPerDay[x]);
    var config = {
        type: 'line',
        data: {
            labels: daysVisits,
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
                        labelString: 'Days'
                    }
                },
                y: {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Visits'
                    }
                },
                yAxes: [{ "ticks": { "precision": 0, "fontColor": "white" } }]
            }
        }
    };
    window.myBar = new Chart(ctx, config);
    if(window.myBar != null){
        window.myBar.update();
    }

}