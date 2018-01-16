import time


class MemCache(object):
    class Record:
        def __init__(self, value):
            self.time = time.time()
            self.value = value

        def clear(self):
            self.value = None

        def expired(self, timeout):
            return time.time() - self.time >= timeout
    '''
    A global dict to help cache some temporary data.
    '''
    def __init__(self, timeout=-1):
        self._timeout = timeout
        self._data = {}

    def set(self, key, value):
        self._data[key] = MemCache.Record(value)

    def get(self, key):
        rcd = self._data.get(key, None)
        if not rcd: return None
        # do not delete the key to accelerate speed
        if rcd.expired(self._timeout):
            rcd.clear()
            return None
        return rcd.value

if __name__ == '__main__':
    import unittest

    class TestMemCacheTest(unittest.TestCase):
        def setUp(self):
            self.cache = MemCache(timeout=2)

        def test_have_key(self):
            self.cache.set('message', 'hello')
            self.assertTrue(self.cache.get('message'))
            time.sleep(3)
            self.assertFalse(self.cache.get('message'))

    unittest.main()
