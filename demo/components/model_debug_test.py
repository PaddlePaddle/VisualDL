import os
import visualdl

if __name__ == '__main__':
    logdir = os.getcwd()
    visualdl.server.app.run(logdir,
                            work_dir="/home/work/visualdl_test",
                            host="127.0.0.1",
                            port=8080,
                            cache_timeout=20,
                            language=None,
                            public_path=None,
                            api_only=True,
                            open_browser=False)
