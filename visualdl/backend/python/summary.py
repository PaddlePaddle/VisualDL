__all__ = [
    'set_storage',
    'scalar',
]
import core

im = core.im()

dtypes = ("float", "double", "int32", "int64")


def set_storage(dir):
    '''
    :param dir: str
        directory of summary to write log.
    :return: None
    '''
    im.storage().set_dir(dir)


class _Scalar(object):
    '''
    Python syntax wrapper for the core.ScalarHelper object.
    '''

    def __init__(self, core_object):
        self._core_object = core_object

    def add(self, id, vs):
        '''
        add a scalar record
        :param id: int
        id in the x-corrdinate
        :param vs: list
        values
        :return: None
        '''
        self._core_object.add_record(id, vs)

    def set_captions(self, cs):
        '''
        set the captions, one caption for one line.
        :param cs: list of str
        :return: None
        '''
        self._core_object.set_captions(cs)

    @property
    def captions(self):
        return self._core_object.get_captions()

    @property
    def records(self):
        '''
        get all the records, format like
        [
        [0.1, 0.2], # first record
        [0.2, 0.3], # second record
        # ...
        ]
        :return: list of list
        '''
        return self._core_object.get_records()

    @property
    def ids(self):
        '''
        get all the ids for the records
        :return: list of int
        '''
        return self._core_object.get_ids()

    @property
    def timestamps(self):
        '''
        get all the timestamps for the records
        :return: list of int
        '''
        return self._core_object.get_timestamps()

    @property
    def size(self):
        return self._core_object.get_record_size()


def scalar(tag, dtype='float'):
    '''
    create a scalar component.

    :param tag: str
        name of this component.
    :param dtype: string
        the data type that will be used in underlying storage.
    :return: object of core.Tablet
    '''
    assert dtype in dtypes, "invalid dtype(%s), should be one of %s" % (
        dtype, str(dtypes))
    tablet = im.add_tablet(tag, -1)
    dtype2obj = {
        'float': tablet.as_float_scalar,
        'double': tablet.as_double_scalar,
        'int32': tablet.as_int32_scalar,
        'int64': tablet.as_int64_scalar,
    }
    obj = dtype2obj[dtype]()
    return _Scalar(obj)
