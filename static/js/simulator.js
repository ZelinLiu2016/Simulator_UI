function simulator()
{
    var s = $("#start_date").val();
    var e = $("#end_date").val();
    var self_learn = $('[name="mySwitch"]').is(':checked');
    var postData = {"start_date": s, "end_date": e, "self_learn": self_learn};
    if (s == "" || e == "")
    {
        alert("日期不规范");
        return;
    }
    if (s < '2017-01-20' || s > '2018-04-24' || e < '2017-01-20' || e > '2018-04-24')
    {
        alert("模拟日期不得早于2017-01-20， 不得晚于2018-04-24");
        return;
    }
    if (s > e)
    {
        alert("开始日期不得晚于结束日期");
        return;
    }
    $.ajax({
        type: "POST",
        url: "/simulator",
        data: JSON.stringify(postData),
        contentType:"application/json",
        beforeSend: function () {
            ShowDiv();
        },
        complete: function () {
            HiddenDiv();
        },
        success: function (data) {
            console.log(data);
            var d = JSON.parse(data);
            draw(d.data);
            var previousPoint = null;
            $("#flot_draw").bind("plothover", function (event, pos, item) {
                if (item) {
                    if (previousPoint != item.dataIndex) {
                        previousPoint = item.dataIndex;
                        $("#tooltip").remove();
                        var y = item.datapoint[1].toFixed(0);
                        var tip = "订单量：";
                        showTooltip(item.pageX, item.pageY,tip+y);
                    }
                }
                else {
                    $("#tooltip").remove();
                    previousPoint = null;
                }
            });
        },
        error: function () {
            alert("获取数据失败！");
        }
    });
}

function draw(order_data)
{
    predict_data = []
    real_data = []
    for(var i = 0;i<order_data.length;++i)
    {
        predict_data.push([new Date(order_data[i].date).getTime(), order_data[i].predict]);
        real_data.push([new Date(order_data[i].date).getTime(), order_data[i].real]);
    }
    console.log(predict_data);
    var pl = $.plot($("#flot_draw"),
    [{ label: "模拟订单量", data:predict_data},
     { label: "真实订单量", data:real_data}
    ],
    {
        series: {
            lines: { show: true},
            points: { show: true}
        },
    grid: {
        hoverable: true,
        clickable: true,
        borderColor:'#000',
        borderWidth:1
    },
    xaxis: {
        mode: "time",
        timeformat: "%y-%m-%d"
    },
    yaxis: {
        min: 0
    }
    });
}

function showTooltip(x, y, contents) {
    $('<div id="tooltip">' + contents + '</div>').css({
        position: 'absolute',
        display: 'none',
        top: y + 10,
        left: x + 10,
        border: '1px solid #fdd',
        padding: '2px',
        'background-color': '#dfeffc',
        opacity: 0.80
    }).appendTo("body").fadeIn(200);
}

function ShowDiv() {
    $("#myModal").modal('show');
}

function HiddenDiv() {
    $("#myModal").modal('hide');
}