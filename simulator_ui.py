import os.path
import tornado.ioloop
import tornado.web
import tornado.options
import json
import csv
import datetime as dt
import pandas as pd
from Simulator import Simulator
from conversion import train_conversion
from datetime_utils import str2date, date2str
from user_price import load_price_range
from user_airline import gen_weekday_airline_dtb
from utils import random_generate
from user_category import gen_weekday_category_dtb
from user_class import gen_weekday_class_dtb


settings = {
    "static_path": os.path.join(os.path.dirname(__file__), "static"),
}


class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")


class QueryHandler(tornado.web.RequestHandler):
    def post(self):
        # response = {'status': 'success', 'data': [{'date': '2018-03-01', 'predict': 125, 'real': 122},
        #                                {'date': '2018-03-02', 'predict': 129, 'real': 147},
        #                                {'date': '2018-03-03', 'predict': 136, 'real': 120},
        #                                {'date': '2018-03-04', 'predict': 118, 'real': 108},
        #                                {'date': '2018-03-05', 'predict': 131, 'real': 122},
        #                                {'date': '2018-03-06', 'predict': 108, 'real': 139}]}
        # self.write(json.dumps(response))
        r_df = pd.read_csv("data/search/order_qty_searchdate.csv")
        data = json.loads(self.request.body)
        begin_date = dt.datetime.strptime(data["start_date"], "%Y-%m-%d")
        end_date = dt.datetime.strptime(data["end_date"], "%Y-%m-%d")
        s_l = data["self_learn"]
        pre_begin_date = begin_date - dt.timedelta(days=TRAIN_DURATION)
        d = pre_begin_date
        while d < begin_date:
            d_str = date2str(d)
            search_list = search_dict[d_str]
            predict_order(d_str, search_list, category_distribution, class_distribution, airline_distribution,
                          user_price, px_dict, conv_rate, meta_dict)
            d = d + dt.timedelta(days=1)
        search_date = begin_date
        ret = []
        while search_date <= end_date:
            search_date_str = date2str(search_date)
            print search_date_str
            search_list = search_dict[search_date_str]
            conv_rate_list = train_conversion(search_date - dt.timedelta(days=TRAIN_DURATION),
                                              search_date - dt.timedelta(days=1), real_df, meta_dict, s_l)
            orders, r = predict_order(search_date_str, search_list, category_distribution, class_distribution,
                                      airline_distribution, user_price, px_dict, conv_rate_list, meta_dict)
            simulate_orders[search_date_str] = orders
            ret.append({'date': search_date_str, 'predict': orders, 'real': int(r_df[r_df.fdate == search_date_str].iloc[0].order_cnt)})
            search_date = search_date + dt.timedelta(days=1)
        response = {"status": "success", "data": ret}
        self.write(json.dumps(response))


handlers = [
    (r"/", IndexHandler),
    (r"/simulator", QueryHandler),
]


def find_all_tickets(search_date, flight_date, price_dict):
    ret = price_dict.get((search_date, flight_date), [])
    return ret


def predict_order(s_d_str, s_list, category_dtb, class_dtb, airline_dtb, price_range, price_dict, conversion_rate, history_unconv, price_diff=0):
    # search_list: search cnt for different days after current day
    # simulator: a simulator
    order_cnt = 0
    revenue = 0
    history_unconv[s_d_str] = [0]*181
    for i in range(len(s_list)):
        flight_date = str2date(s_d_str) + dt.timedelta(days=i)
        week_day = flight_date.weekday() + 1
        flight_date_str = date2str(flight_date)
        search_number = s_list[i]
        simulator = Simulator(search_number, week_day)

        simulator.generate(category_dtb, class_dtb, airline_dtb, price_range)
        tickets = find_all_tickets(s_d_str, flight_date_str, price_dict)
        new_tickets = []
        for j in range(len(tickets)):
            new_tickets.append((tickets[j][0], tickets[j][1], tickets[j][2]+price_diff))
        for u in simulator.Users:
            ticket_selected = u.choice_feature(new_tickets, 0.57)
            if ticket_selected is not None:
                history_unconv[s_d_str][i] += 1
                conv_prob = {0: 1 - conversion_rate[i], 1: conversion_rate[i]}
                conv = random_generate(conv_prob)
                order_cnt += conv
                revenue += conv * ticket_selected[2]
    return order_cnt, revenue


def get_search_data():
    file = "data/search/Search.csv"
    search_dict = {}
    with open(file, 'rb') as csvfile:
        csv_reader = csv.reader(csvfile)
        for row in csv_reader:
            if row[0] != 'search_date':
                search_dict[row[0]] = [int(row[i]) for i in range(1, len(row))]
    return search_dict


def get_price_data():
    price_dict = {}
    price_list = pd.read_csv("data/price/all_price.csv").values.tolist()
    for row in price_list:
        s_d = row[1]
        f_d = row[0].split(' ')[0]
        if (s_d, f_d) not in price_dict:
            price_dict[(s_d, f_d)] = []
        price_dict[(s_d, f_d)].append((row[2], row[3], float(row[5])))
    return price_dict


if __name__ == "__main__":
    simulate_orders = {}
    category_distribution = gen_weekday_category_dtb()
    class_distribution = gen_weekday_class_dtb()
    airline_distribution = gen_weekday_airline_dtb()
    user_price = load_price_range()
    search_dict = get_search_data()
    px_dict = get_price_data()
    conv_df = pd.read_csv("data/search/conversion_rate.csv")
    conv_rate = dict(conv_df.values.tolist())
    real_df = pd.read_csv("data/search/order_qty_searchdate.csv", index_col='fdate')
    meta_dict = {}
    TRAIN_DURATION = 14
    print 'OK'
    app = tornado.web.Application(handlers, **settings)
    app.listen(8001)
    tornado.ioloop.IOLoop.instance().start()
