import socket


def is_open(port):
    local_ip = '127.0.0.1'
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.connect((local_ip, int(port)))
        s.shutdown(2)
        return True
    except:
        return False


def get_hostname():
    return socket.gethostname()


def find_unused_port():
    """
    get a unused port of this machine
    :return: available port
    """
    min_port = 7000
    max_port = 7999
    aval_port = None
    for port in range(min_port, max_port):
        if not is_open(port):
            aval_port = port
            break
    return aval_port

if __name__ == '__main__':
    print find_unused_port()
