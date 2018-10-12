players = {}
day_idx = 0
section = 0


def is_over(players):
    villager = []
    wolf = []
    god = []
    for k, v in players.items():
        if v['Status'] == 1:
            if v['Type'] == 'Wolf':
                wolf.append(k)
            elif v['Type'] == 'Villager':
                villager.append(k)
            else:
                god.append(k)
    if len(god) == 0 or len(god) == 0:
        print('Wolves Win')
        return 0
    if len(wolf) == 0:
        print('Villagers Win')
        return 1
    return 2


def game():
    people_num = input('Input the number of players')
    people_num = 12
    day_count = 1
    player_dict = {}
    while(True):
        print player_dict
        if day_count == 1:
            print first_night(player_dict)
        else:
            print night(player_dict)
        if is_over(player_dict):
            break
        night_skills(player_dict)
        if is_over(player_dict):
            break
        print day(player_dict)
        if is_over(player_dict):
            break
        day_skills(player_dict)
        if is_over(player_dict):
            break
        day_count += 1


def first_night(players):
    wolves = raw_input('Wovles Go, Input Numbers of Wolves')
    wolve_idx_list = wolves.split()
    for w_idx in wolve_idx_list:
        players[int(w_idx)] = Pig('Wolf')
    kill = raw_input('Wovles Killed')
    kill_idx = int(kill)

    witch = raw_input('Witch Up, Input Number of Witch')
    witch_idx = int(witch)
    players[witch_idx] = Pig('Witch')
    save = int(raw_input('This Guy died tonight, save him ? %d' % kill_idx))
    if kill_idx == witch_idx:
        save = 0
    if save == 1:
        print('Wanna poison who ?')
        poison_idx = -1
    else:
        poison = raw_input('Wanna poison who ?')
        poison_idx = int(poison)

    seer = raw_input('Seer Up, Input Number of Seer')
    seer_idx = int(seer)
    players[seer_idx] = Pig('Seer')
    identify = raw_input('Which one to identify ?')
    if identify not in wolve_idx_list:
        print('This Guy is Good')
    else:
        print('This Guy is Bad')

    gun = raw_input('Gun Up, Input Number of Gun')
    gun_idx = int(gun)
    players[gun_idx] = Pig('Gun')
    if poison_idx == gun_idx:
        print('Your Gun is NOT OK')
    else:
        print('Your Gun IS OK')

    idiot = raw_input('Idiot Up, Input Number of Idiot')
    idiot_idx = int(idiot)
    players[idiot_idx] = Pig('Idiot')

    for i in range(1, 13):
        if i not in players:
            players[i] = Pig('Villager')

    dead = []
    if kill_idx != -1 and save == 0:
        dead.append(kill_idx)
    if poison_idx != -1:
        if poison_idx not in dead:
            dead.append(poison_idx)
    for d in dead:
        players[d].status = 0
    return dead


def night(players):
    witch_idx = -1
    gun_idx = -1
    for k, v in players.items():
        if v.type == 'Witch':
            witch_idx = k
        if v.type == 'Gun':
            gun_idx = k

    kill = raw_input('Wovles Killed')
    kill_idx = int(kill)

    save = int(raw_input('This Guy died tonight, save him ? %d' % kill_idx))
    if kill_idx == witch_idx:
        save = 0
    poison = raw_input('Wanna poison who ?')
    poison_idx = int(poison)

    identify = raw_input('Which one to identify ?')
    if players[int(identify)].type != 'Wolf':
        print('This Guy is Good')
    else:
        print('This Guy is Bad')

    if poison_idx == gun_idx:
        print('Your Gun is NOT OK')
    else:
        print('Your Gun IS OK')

    dead = []
    if kill_idx != -1 and save != 0:
        dead.append(kill_idx)
    if poison_idx != -1:
        if poison_idx not in dead:
            dead.append(poison_idx)
    for d in dead:
        players[d].status = 0
    return dead


def night_skills(players):
    return


def day(players):
    died = raw_input('Who died in the day')
    died_list = died.split()
    for d in died_list:
        players[int(d)].status = 0
    return


def day_skills(players):
    return


class Pig:
    def __init__(self, t):
        self.type = t
        self.status = 1


def init_game():
    global players, day_idx, section
    players = {}
    day_idx = 0
    section = 0


def update_game(data):
    global players, day_idx, section
    players = data['players']
    day_idx = data['day_idx']
    section = data['section']
    result = is_over(players)
    return result


if __name__ == '__main__':
    game()
