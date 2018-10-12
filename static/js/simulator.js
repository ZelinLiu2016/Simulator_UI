function simulator()
{
    var s = $("#start_date").val();
    var e = $("#end_date").val();
    console.log(s);
    $.ajax({
			type: "POST",
			url: "/shanggang/ship/mohu",
			data: JSON.stringify(postData),
			contentType:"application/json",
			success: function (data) {
				console.log(data);
				allBoat = [];
				for(var i = 0;i<data.length;++i)
				{
					var info = {"capacity":allMmsi[data[i]].capacity,
					"fleetid":allMmsi[data[i]].fleetid,"imo":allMmsi[data[i]].IMO,"length":allMmsi[data[i]].length,
					"width":allMmsi[data[i]].width,"mmsi":data[i],"shipname":allMmsi[data[i]].shipname,
					"shiptype":allMmsi[data[i]].shiptype,"contact":allMmsi[data[i]].contact,"cellphone":allMmsi[data[i]].cellphone,
					"route_id":allMmsi[data[i]].route_id};
					if(info.fleetid in allCompany)
					{
						info.fleetname = allCompany[info.fleetid].name;
					}
					else{
						info.fleetname = "-";
					}
					if(info.route_id in allHangxian)
					{
						info.route_name = allHangxian[info.route_id].route_name;
					}
					else{
						info.route_name = "-";
					}
					allBoat.push(info);
				}
				project_filter_refresh();
			},
			error: function () {
				alert("获取数据失败！");
			}
		});
}