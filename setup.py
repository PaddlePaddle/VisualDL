from __future__ import absolute_import

import os
import sys
from distutils.spawn import find_executable
from distutils import log
import setuptools.command.build_py
import setuptools
from setuptools import setup, Extension
import subprocess

TOP_DIR = os.path.realpath(os.path.dirname(__file__))
PYTHON_SDK_DIR = os.path.join(TOP_DIR, 'visualdl/python')
BUILD_DIR = os.path.join(TOP_DIR, 'build')
MODE = os.environ.get('VS_BUILD_MODE', 'RELEASE')


def read(name):
    return open(os.path.join(TOP_DIR, name)).read()


def readlines(name):
    return read(name).split('\n')


VERSION_NUMBER = read('VERSION_NUMBER')
LICENSE = readlines('LICENSE')[0].strip()

# use memcache to reduce disk read frequency.
install_requires = ['Flask', 'numpy', 'Pillow', 'protobuf', 'scipy']
execute_requires = ['npm', 'node', 'bash', 'cmake', 'unzip']


def die(msg):
    log.error(msg)
    sys.exit(1)


def CHECK(cond, msg):
    if not cond:
        die(msg)


for exe in execute_requires:
    CHECK(find_executable(exe), "{} should be installed.".format(exe))


class BaseCommand(setuptools.Command):
    user_options = []

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass


class build_py(setuptools.command.build_py.build_py):
    def run(self):
        cmd = ['bash', 'build.sh']
        env = dict(os.environ)
        if MODE == "travis-CI":
            cmd.append('travis-CI')
        if sys.version_info[0] >= 3:
            env["WITH_PYTHON3"] = "ON"
        subprocess.check_call(cmd, env=env)
        return setuptools.command.build_py.build_py.run(self)


cmdclass = {
    'build_py': build_py,
}

packages = [
    'visualdl',
    'visualdl.python',
    'visualdl.server',
    'visualdl.server.mock',
    'visualdl.server.onnx',
]

setup(
    name="visualdl",
    version=VERSION_NUMBER,
    author="PaddlePaddle and Echarts team",
    description="Visualize Deep Learning",
    license=LICENSE,
    keywords="visualization deeplearning",
    long_description=read('README.md'),
    install_requires=install_requires,
    package_data={
        'visualdl.server':
        ['dist/*.js', 'dist/*.html', 'dist/fonts/*', 'dist/images/*'],
        'visualdl': ['core.so'],
        'visualdl.python': ['core.so', 'dog.jpg']
    },
    packages=packages,
    ext_modules=[Extension('_foo', ['stub.cc'])],
    scripts=['visualdl/server/visualDL', 'demo/vdl_create_scratch_log'],
    cmdclass=cmdclass)
