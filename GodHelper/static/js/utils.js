var players = {}
var all_alive = [1,2,3,4,5,6,7,8,9,10,11,12];
var dead = [];
var save = 0;
var day_idx = 0;
var section = 0;


function isValidNumber(num, player_list)
{
    var index = $.inArray(num,player_list);
    return index >= 0;
}

function isValidNumbers(num_list, player_list)
{
    for(var i = 0,len = num_list.length; i < len; i++){
        if (!isValidNumber(num_list[i], player_list))
        {
            return false;
        }
    }
    return true;
}

function isRepeat(arr) {
    var hash = {};
    for (var i in arr) {
        if (hash[arr[i]]){
            return true;
        }
        hash[arr[i]] = true;
    }
    return false;
}

function start()
{
    var postData = {'mode': 1};
    $.ajax({
        type: "POST",
        url: "new_game",
        data: JSON.stringify(postData),
        contentType:"application/json",
        success: function (data) {
            window.location.href ="start_normal";
        },
        error: function () {
            alert("建房失败！");
        }
    });
}

function init_wolf_finish()
{
    all_alive = [1,2,3,4,5,6,7,8,9,10,11,12];
    var wolves = $('#init_wolf').val();
    wolves_list = wolves.split('.');
    wolves_idx_list = [];
    for(var i = 0; i < wolves_list.length; i++)
    {
        wolves_idx_list.push(parseInt(wolves_list[i]));
    }
    if (wolves_idx_list.length != 4)
    {
        alert('输入有误！');
        return;
    }
    if (isRepeat(wolves_idx_list))
    {
        alert('输入有误！');
        return;
    }
    if (!isValidNumbers(wolves_idx_list, all_alive))
    {
        alert('输入有误！');
        return;
    }
    var wolf_kill = $('#wolf_kill').val();
    if (wolf_kill == '')
    {
        wolf_kill_idx = -1;
    }
    else{
        wolf_kill_idx = parseInt(wolf_kill);
        if (!isValidNumber(wolf_kill_idx, all_alive))
        {
            alert('输入有误！');
            return;
        }
    }
    for(var i = 0; i < wolves_idx_list.length; i++)
    {
        players[wolves_idx_list[i]] = {'Status': 1, 'Type': 'Wolf'};
    }
    $('#first_blood').show();
}

function first_blood()
{
    all_alive = [1,2,3,4,5,6,7,8,9,10,11,12];
    var witch = $('#init_witch').val();
    witch_idx = parseInt(witch);
    if (!isValidNumber(witch_idx, all_alive))
    {
        alert('输入有误！')
        return;
    }
    if (isValidNumber(witch_idx, wolves_idx_list))
    {
        alert('输入有误！');
        return;
    }
    players[witch_idx] = {'Status': 1, 'Type': 'Witch'};
    if (wolf_kill_idx > 0)
    {
        w_k = wolf_kill_idx;
    }
    else{
        w_k = '-'
    }
    document.getElementById('man_died').innerHTML = '今晚'+w_k+'死了，是否使用解药';
    if (witch_idx == wolf_kill_idx)
    {
        document.getElementById("use_save").disabled=true;
        document.getElementById("no_save").checked=true;
    }
    $('#witch').show();
}
function init_witch_finish()
{
    save = $('input:radio[name="save"]:checked').val();
    var poison = $('#poison').val();
    if (poison != '')
    {
        poison_idx = parseInt(poison);
    }
    else{
        poison_idx = -1;
    }
    if (poison_idx > 0 && !isValidNumber(poison_idx, all_alive))
    {
        alert('输入有误！');
        return;
    }
    if (poison_idx > 0 && save == 1)
    {
        alert('只能用一瓶药啊！');
        return;
    }
    $('#seer').show();
}

function init_seer()
{
    var seer = $('#init_seer').val();
    seer_idx = parseInt(seer);
    if (!isValidNumber(seer_idx, all_alive))
    {
        alert('输入有误！')
        return;
    }
    if (isValidNumber(seer_idx, wolves_idx_list))
    {
        alert('输入有误！');
        return;
    }
    if (seer_idx == witch_idx)
    {
        alert('输入有误！');
        return;
    }
    players[seer_idx] = {'Status': 1, 'Type': 'Seer'};
    $('#seer_check').show();
}

function seer_check()
{
    var check_people = $('#check_people').val();
    check_people_idx = parseInt(check_people);
    if (!isValidNumber(check_people_idx, all_alive))
    {
        alert('输入有误！')
        return;
    }
    if (check_people_idx in players && players[check_people_idx].Type == 'Wolf')
    {
        document.getElementById('check_result').innerHTML = '他的身份是这个'+'     :狼人';
    }
    else{
        document.getElementById('check_result').innerHTML = '他的身份是这个'+'     :好人';
    }
}

function init_seer_finish()
{
    $('#hunter').show();
}

function init_hunter()
{
    var hunter = $('#init_hunter').val();
    hunter_idx = parseInt(hunter);
    if (!isValidNumber(hunter_idx, all_alive))
    {
        alert('输入有误！')
        return;
    }
    if (isValidNumber(hunter_idx, wolves_idx_list))
    {
        alert('输入有误！');
        return;
    }
    if (hunter_idx == witch_idx)
    {
        alert('输入有误！');
        return;
    }
    if (hunter_idx == seer_idx)
    {
        alert('输入有误！');
        return;
    }
    players[hunter_idx] = {'Status': 1, 'Type': 'Gun'};
    if (poison_idx == hunter_idx)
    {
        document.getElementById('hunter_status').innerHTML = '今晚你开枪状态'+'     :不能';
    }
    else{
        document.getElementById('hunter_status').innerHTML = '今晚你开枪状态'+'     :能';
    }
    $('#hunter_gun').show();
}

function init_hunter_finish()
{
    $('#idiot').show();
}

function init_idiot_finish()
{
    var idiot = $('#init_idiot').val();
    idiot_idx = parseInt(idiot);
    if (!isValidNumber(idiot_idx, all_alive))
    {
        alert('输入有误！')
        return;
    }
    if (isValidNumber(idiot_idx, wolves_idx_list))
    {
        alert('输入有误！');
        return;
    }
    if (idiot_idx == witch_idx)
    {
        alert('输入有误！');
        return;
    }
    if (idiot_idx == seer_idx)
    {
        alert('输入有误！');
        return;
    }
    if (idiot_idx == hunter_idx)
    {
        alert('输入有误！');
        return;
    }
    players[idiot_idx] = {'Status': 1, 'Type': 'Idiot'};
    for(var i = 0; i < all_alive.length; i++){
        if (!(all_alive[i] in players))
        {
            players[all_alive[i]] = {'Type': 'Villager', 'Status': 1};
        }
    }
    dead = []
    if (wolf_kill_idx != -1 && save == 0)
    {
        dead.push(wolf_kill_idx);
    }
    if (poison_idx != -1)
    {
        if (!(poison_idx in dead))
        {
            dead.push(poison_idx);
        }
    }
    for(var i = 0; i < dead.length; i++){
        players[dead[i]].status = 0
    }
    $('#finish').show();
}

function finish()
{
    day_idx = 1;
    section = 0;
    var postData = {'players': players, 'day_idx': day_idx, 'section': section, 'dead': dead, 'datatype': 'initial'};
    $.ajax({
        type: "POST",
        url: "new_game",
        data: JSON.stringify(postData),
        contentType:"application/json",
        success: function (data) {
            if (data['game_result'] == 0)
            {
                alert('狼人胜利');
            }
            else if (data['game_result'] == 1){
                alert('好人胜利');
            }
            else{
                $('#init_night').hide();
                $('#dead').show();
                document.getElementById('dead_detail').innerHTML = '死讯'+ String(dead);
            }
        },
        error: function () {
            alert("提交失败！");
            day_idx = 0;
            section = 0;
        }
    });
}