import logging

logger = logging

logger.basicConfig(
    format='[%(levelname)s %(asctime)s %(filename)s:%(lineno)s] %(message)s')
logger.getLogger().setLevel(logging.INFO)
