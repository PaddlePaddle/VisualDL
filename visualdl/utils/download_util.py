# Copyright (c) 2021 VisualDL Authors. All Rights Reserve.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# =======================================================================
import os
import time
import random
import sys
import shutil
from time import sleep, ctime
from visualdl.server.log import logger
from subprocess import Popen, PIPE, DEVNULL
import multiprocessing
from multiprocessing import Process
from multiprocessing import Pool, Queue, Manager

def download_model_data(hadoop_bin, hadoop_ugi, afs_input, local_dir, join_network, update_network):
    """
    Download model debug data from afs
    Args:
        hadoop_bin: hadoop bin path
        hadoop_ugi: hadoop user and password
        afs_input: afs path to dowanload data,eg:afs://test.afs.baidu.com:9902/user/test/visual/random_dump/join/20211015/delta-6
        local_dir: which local path to save the afs data
        join_network: join network file
        update_network: update network file
    Returns:
        None
    """
    logger.info(f"{hadoop_bin} fs -D hadoop.job.ugi={hadoop_ugi} -test -e {afs_input}")
    cmd = [hadoop_bin, "fs",
           "-D", f"hadoop.job.ugi={hadoop_ugi}",
           "-test", "-e", afs_input]
    if Popen(cmd, stdout=DEVNULL, stderr=DEVNULL).wait():
        logger.error(f"{afs_input} not exsit!")
        return
    if os.path.exists(local_dir): shutil.rmtree(local_dir)
    os.makedirs(local_dir)

    input_dir = afs_input.split('/random_dump')[0]
    input_date = afs_input.split('/')[-2]
    delta_file = afs_input.split('/')[-1]
    input_dir= f"{input_dir}/random_dump"
    thread_num = 10
    if join_network == 'null' or update_network == 'null':
        logger.error("join or update network is empty")
        return
    for stage in ['join', 'update']:
        download_path = f"{local_dir}/{stage}"
        input = f"{input_dir}/{stage}/{input_date}/{delta_file}"
        if not os.path.exists(download_path): os.makedirs(download_path)
        logger.info(f"{hadoop_bin} fs -D hadoop.job.ugi={hadoop_ugi} -ls {input}")
        cmd = [hadoop_bin, "fs", "-D", f"hadoop.job.ugi={hadoop_ugi}",
              "-ls", input]
        shell = Popen(cmd, encoding="utf8", stdout=PIPE, stderr=DEVNULL)
        file_name_lists = []
        total_size = 0
        for line in shell.stdout:
            if 'Found' in line:
                continue
            size = int(line.strip().split(" ")[-4])
            if size == 0:
                continue
            total_size += size
            file_name = line.strip().split('/')[-1]
            file_name_lists.append(file_name)
            #total_size bigger than 10g, filter
            if float(total_size) / (1024 * 1024 * 1024) > 10:
                break
        if len(file_name_lists) != 0:
            if thread_num > len(file_name_lists):
                thread_num = len(file_name_lists)
            lock = multiprocessing.RLock()
            for index in range(thread_num):
                p1 = multiprocessing.Process(target=multi_thread_download,
                                            args=(index, hadoop_bin, hadoop_ugi, stage,
                                            input, download_path, file_name_lists))
                p1.start()
                p1.join()
                logger.info("download {stage} model data done")

def multi_thread_download(index, hadoop_bin, hadoop_ugi, stage, input, download_path, file_name_lists):
    """
    Multi thread to download model data
    Args:
        index: the index of array item
        hadoop_bin: hadoop bin path
        hadoop_ugi: hadoop user and password
        stage: join or update stage
        input: afs path to dowanload data
        download_path: which local path to save the afs data
        file_name_lists: all the file names to download from afs
    Returns:
        None
    """
    logger.info(f"{hadoop_bin} fs -D hadoop.job.ugi={hadoop_ugi} \
                -get {input}/{file_name_lists[index]} {download_path}/{file_name_lists[index]}")
    cmd = [hadoop_bin, "fs", "-D", f"hadoop.job.ugi={hadoop_ugi}", 
           "-get", f"{input}/{file_name_lists[index]}", f"{download_path}/{file_name_lists[index]}"]
    shell = Popen(cmd, encoding="utf8", stdout=PIPE, stderr=DEVNULL)


def get_local_model_data(local_input, local_dir, join_network, update_network):
    """
    Get local dump model data
    Args:
        input_path: local dowanload data,eg:/home/work/test/random_dump/join(or update)/day/delta-5
        local_dir: which local path to save the afs data
        join_network: join network file
        update_network: update network file
    Returns:
        None
    """
    if join_network == 'null' or update_network == 'null':
        logger.error("join or update network is empty")
        return
    if os.path.exists(local_dir): shutil.rmtree(local_dir)
    os.makedirs(local_dir)
    input_dir = local_input.split('/random_dump')[0]
    input_date = local_input.split('/')[-2]
    delta_file = local_input.split('/')[-1]
    input_dir= f"{input_dir}/random_dump"
    for stage in ['join', 'update']:
        download_path = f"{local_dir}/{stage}/"
        input = f"{input_dir}/{stage}/{input_date}/{delta_file}"
        if not os.path.exists(input):
            continue
        if len(os.listdir(f"{input}")) == 0:
            continue
        if not os.path.exists(download_path): os.makedirs(download_path)
        cmd = f"cp {input}/* {download_path}"
        os.system(cmd)
        logger.info(f"download {stage} model data done")
