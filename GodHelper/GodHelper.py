import os.path
import tornado.ioloop
import tornado.web
import tornado.options
import json
from Werewolves import init_game, update_game

settings = {
    "static_path": os.path.join(os.path.dirname(__file__), "static"),
}

players = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
}


class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")


class NewGameHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("helper.html")

    def post(self):
        data = json.loads(self.request.body)
        if 'datatype' in data:
            if data['datatype'] == 'initial':
                game_result = update_game(data)
                self.write({'day_idx': 1, 'section': 2, 'game_result': game_result})
            elif data['datatype'] == 1:
                pass
        else:
            print data
            init_game()
            self.write("init_night.html")


class StartNormalHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("init_night.html")


class NotImplementedHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("empty.html")


handlers = [
    (r"/", IndexHandler),
    (r"/new_game", NewGameHandler),
    (r"/rules", NotImplementedHandler),
    (r"/load_game", NotImplementedHandler),
    (r"/start_normal", StartNormalHandler),
]


if __name__ == "__main__":
    app = tornado.web.Application(handlers, **settings)
    app.listen(8000)
    tornado.ioloop.IOLoop.instance().start()
