from __future__ import absolute_import

import os
import sys
from distutils.spawn import find_executable
from distutils import sysconfig, dep_util, log
import setuptools.command.build_py
import setuptools
from setuptools import setup, find_packages
import subprocess

TOP_DIR = os.path.realpath(os.path.dirname(__file__))
PYTHON_SDK_DIR = os.path.join(TOP_DIR, 'visualdl/python')
BUILD_DIR = os.path.join(TOP_DIR, 'build')


def read(name):
    return open(os.path.join(TOP_DIR, name)).read()


def readlines(name):
    return read(name).split('\n')


VERSION_NUMBER = read('VERSION_NUMBER')
LICENSE = readlines('LICENSE')[0].strip()

install_requires = ['Flask', 'numpy', 'Pillow', 'protobuf']
execute_requires = ['npm', 'node', 'protoc', 'bash']


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
        subprocess.check_call(['bash', 'build.sh'])
        return setuptools.command.build_py.build_py.run(self)


cmdclass = {
    'build_py': build_py,
}

packages = [
    '',
]

setup(
    name="visualdl",
    version=VERSION_NUMBER,
    author="PaddlePaddle and Echarts team.",
    description="Visualize Deep Learning.",
    license=LICENSE,
    keywords="visualization deeplearning",
    long_description=read('README.md'),
    install_requires=install_requires,
    package_data={'frontend.dist': ['*', 'fonts/*'],
                  'visualdl':['core.so']},
    packages=packages,
    package_dir={'': 'pip_package/visualdl',
                 'server': 'pip_package/visualdl/server'},
    scripts=['visualdl/server/visualdl.py'],
    include_package_data=True,
    cmdclass=cmdclass)
