import os
import visualdl
from visualdl.server import app

logdir = os.getcwd()
visualdl.server.app.run(logdir,
                        host="127.0.0.01",
                        port=8080,
                        cache_timeout=20,
                        language=None,
                        public_path=None,
                        api_only=True,
                        open_browser=False)
