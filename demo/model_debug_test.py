import os
import visualdl

if __name__ == '__main__':
    work_dir = os.getcwd()
    visualdl.server.app.run(work_dir,
                            host="127.0.0.1",
                            port=8080,
                            cache_timeout=20,
                            language=None,
                            public_path=None,
                            api_only=True,
                            open_browser=False)
