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
import sys
import shutil
import argparse
import multiprocessing
import numpy as np

from visualdl.server.log import logger
from visualdl.thirdparty import create_network
from visualdl.thirdparty import download_util

FLOAT_MIN = sys.float_info.min
FLOAT_MAX = sys.float_info.max


class ModelAnalysis(object):
    """
    Model data analysis: support multi-dimensional model
    analysis capabilities, such as model network analysis
    and effect evaluation, realize data visualization of
    each layer of network nodes, and improve model interpretability.
    For example, through model network visualization, network nodes
    with high deactivation rate and nodes with high proportion of
    output zero can be found.

    Only the following steps are required to achieve this function above:
    Firstly to download the network data which randomly dropped by the model.
    Secondly to analyze the network node data according to the training batch,
    and store the results in the local file for subsequent front-end data rendering and display.
    """

    def __init__(self, params):
        """
        Init function

        Args:
            params: the class basic args, eg:
            {
                "hadoop_bin": "/home/work/hadoop/bin/hadoop",
                "ugi": "**",
                "debug_input": "afs://**/test/visualdl/random_dump/join/20211015",
                "delta_num": "8",
                "join_pbtxt": "/home/work/test_download/train/join_main_program.pbtxt",
                "update_pbtxt": "/home/work/test_download/train/update_main_program.pbtxt"
            }

        Returns:
            None
        """
        self._args = dict()
        self._work_dir = str()
        self._train_dir = str()
        self._log_dir = str()
        self._main_dir = os.getcwd()
        self._parse_args(params)
        self._make_tmp_dir()
        self._layer_summary = dict()
        self._grad_summary = dict()
        self._icafe_bug = 0

    def __del__(self):
        """
        Clean function

        Args:
            None

        Returns:
            None
        """
        if os.path.exists(self._work_dir):
            shutil.rmtree(self._work_dir)

    def __call__(self):
        """
        Start fuction, complete the following task:
            1.download debug model data
            2.download network.pbtext file and generate the network topology
            3.process join or update debug data
            4.calculate the target value
            5.save the result

        Args:
            None

        Returns:
            None
        """
        self._multi_process()

    def _parse_args(self, kwargs):
        """
        Parse args

        Args:
            kwargs: the class basic args, like:
            {
                "hadoop_bin": "/home/work/hadoop/bin/hadoop",
                "ugi": "**",
                "debug_input": "afs://**/test/visualdl/random_dump/join/20211015",
                "delta_num": "8",
                "join_pbtxt": "/home/work/test_download/train/join_main_program.pbtxt",
                "update_pbtxt": "/home/work/test_download/train/update_main_program.pbtxt"
            }

        Returns:
            None
        """
        parser = argparse.ArgumentParser()
        if "data_dir" in kwargs:
            self._args["work_dir"] = kwargs.get("data_dir")
        else:
            self._args["work_dir"] = os.getcwd()
        if "hadoop_bin" in kwargs:
            self._args["hadoop_bin"] = kwargs.get("hadoop_bin")
        else:
            parser.add_argument("--hadoop_bin", help="hadoop bin path")
        if "ugi" in kwargs:
            self._args["ugi"] = kwargs.get("ugi")
        else:
            parser.add_argument("--ugi", help="hadoop ugi")
        if "delta_num" in kwargs:
            self._args["delta_num"] = kwargs.get("delta_num")
        else:
            parser.add_argument("--delta_num", help="delta num", required=True)
        if "debug_input" in kwargs:
            self._args["debug_input"] = kwargs.get("debug_input")
        else:
            parser.add_argument("--debug_input", help="debug data file", required=True)
        if "join_pbtxt" in kwargs:
            self._args["join_pbtxt"] = kwargs.get("join_pbtxt")
        else:
            parser.add_argument("--join_pbtxt", help="join network.pbtxt")
        if "update_pbtxt" in kwargs:
            self._args["update_pbtxt"] = kwargs.get("update_pbtxt")
        else:
            parser.add_argument("--update_pbtxt", help="update network.pbtxt")
        if "tag" in kwargs:
            self._args["tag"] = kwargs.get("tag")
        else:
            parser.add_argument("--tag", help="source tag")
        if "is_div" in kwargs:
            self._args["is_div"] = kwargs.get("is_div")
        else:
            parser.add_argument("--is_div", help="diff by source type", type=int, default=0)
        if "source" in kwargs:
            self._args["source"] = kwargs.get("source")
        else:
            parser.add_argument("--source", help="source type")
        self._args.update(parser.parse_args().__dict__)

    def _make_tmp_dir(self):
        """
        Create working directory

        Args:
            None

        Returns:
            None
        """
        self._work_dir = os.path.join(self._args["work_dir"], 'data')
        self._train_dir = os.path.join(self._args["work_dir"], 'data/train_env')
        self._output_dir = os.path.join(self._args["work_dir"], 'output')
        logger.info("create working directory: {}".format(self._work_dir))
        logger.info("train env dir: {}".format(self._train_dir))
        logger.info("save reslut dir: {}".format(self._output_dir))
        if os.path.exists(self._work_dir):
            shutil.rmtree(self._work_dir)
        if not os.path.exists(self._work_dir):
            os.mkdir(self._work_dir)
        if not os.path.exists(self._train_dir):
            os.mkdir(self._train_dir)
        if os.path.exists(self._output_dir):
            shutil.rmtree(self._output_dir)
        os.mkdir(self._output_dir)

    def _multi_process(self):
        """
        Multi process to download dumped data

        Args:
            None

        Returns:
            None
        """
        p1 = multiprocessing.Process(target=self._network_run, )
        p2 = multiprocessing.Process(target=self._data_run, )
        p1.start()
        p2.start()
        p1.join()
        logger.info("download_mpi_task done")
        p2.join()
        logger.info("work_task done")

    def _network_run(self):
        """
        Identify local network topology files

        Args:
            None

        Returns:
            None
        """
        if self._args.get("join_pbtxt") != "null" and os.path.exists(self._args.get("join_pbtxt")):
            join_main_program = "{}/join_main_program.pbtxt".format(self._train_dir)
            shutil.copyfile(self._args.get("join_pbtxt"), join_main_program)
            network = create_network.get_network('join', join_main_program)
            if network:
                create_network.save_network(network, 'join')
            else:
                logger.error("join network is empty")
        else:
            logger.error("join_pbtxt file is empty")
        if self._args.get("update_pbtxt") != "null" and os.path.exists(self._args.get("update_pbtxt")):
            update_main_program = "{}/update_main_program.pbtxt".format(self._train_dir)
            shutil.copyfile(self._args.get("update_pbtxt"), update_main_program)
            network = create_network.get_network('update', update_main_program)
            if network:
                create_network.save_network(network, 'update')
            else:
                logger.error("update network is empty")
        else:
            logger.error("update_pbtxt file is empty")

    def _data_run(self):
        """
        Multi process thread to get results, by 4 steps:
            1) download model debug data
            2) process model debug data
            3) save data by forward and reverse gradient
            4) save evaluation results

        Args:
            None

        Returns:
            None
        """
        self._download_debug_input()
        self._get_result()
        self._save_result(self._layer_summary)
        self._save_result(self._grad_summary)

    def _multi_download_data(self, num):
        """
        Download delta data by multithread

        Args:
            num: which delta to download

        Returns:
            None
        """
        delta_n = str(num)
        input_file = self._args.get("debug_input") + '/delta-' + delta_n
        delta_dir = self._work_dir + '/delta-' + delta_n

        if self._args.get("join_pbtxt") is not None:
            join_pbtxt_para = self._args.get("join_pbtxt")
        else:
            join_pbtxt_para = "join_invalid"
        if self._args.get("update_pbtxt") is not None:
            update_pbtxt_para = self._args.get("update_pbtxt")
        else:
            update_pbtxt_para = "update_invalid"

        if 'afs://' in input_file:
            # afs input,eg:afs://**/test/visual/random_dump/join/20211015/delta-6
            download_util.download_model_data(self._args["hadoop_bin"], self._args.get("ugi"),
                                              input_file, delta_dir, join_pbtxt_para, update_pbtxt_para)
        else:
            # local debug data,eg /home/work/test/random_dump/join(or update)/20211015/delta-5
            download_util.get_local_model_data(input_file, delta_dir, join_pbtxt_para, update_pbtxt_para)
        logger.info("download debug input...")

    def _get_delta_num_list(self):
        """
        Hadle delta_num to delta_num_list

        Args:
            None

        Returns:
            None
        """
        delta_num_list = []
        delta_num = self._args["delta_num"]
        if "-" in delta_num:
            delta_num_l = delta_num.split('-')
            start_delta = int(delta_num_l[0])
            end_delta = int(delta_num_l[1])
            delta_num_list = range(start_delta, end_delta + 1)
        elif "," in delta_num:
            delta_num_l = delta_num.split(',')
            for i in delta_num_l:
                if i:
                    delta_num_list.append(int(i))
        elif int(delta_num) == 120:
            delta_num_list = [48, 72, 120]
        elif int(delta_num) == 20:
            delta_num_list = [8, 12, 20]
        else:
            delta_num_list.append(int(delta_num))

        return delta_num_list

    def _download_debug_input(self):
        """
        Download debug input

        Args:
            None

        Returns:
            None
        """
        logger.info("download debug data")
        delta_num_list = self._get_delta_num_list()
        p_num = len(delta_num_list)
        lst_p = []
        for i in range(p_num):
            p = multiprocessing.Process(target=self._multi_download_data, args=(delta_num_list[i], ))
            p.start()
            lst_p.append(p)
        for i in lst_p:
            i.join()
        # filter source
        div_tag = ''
        tag_value = []
        if self._args["is_div"] == 1:
            div_tag = self._args["tag"]
            tag_value = self._args["source"].strip().split(',')

        for num in delta_num_list:
            delta_dir = self._work_dir + "/delta-" + str(num)
            if not os.path.exists(delta_dir):
                continue
            dest_join_file = delta_dir + "/join_parts"
            dest_update_file = delta_dir + "/update_parts"
            self._get_debug_data(delta_dir, 'join', div_tag, tag_value)
            self._get_debug_data(delta_dir, 'update', div_tag, tag_value)
            join_files = delta_dir + '/join'
            update_files = delta_dir + '/update'
            if os.path.exists(join_files):
                shutil.rmtree(join_files)
            if os.path.exists(update_files):
                shutil.rmtree(update_files)
            # init layer
            delta_key = "delta_" + str(num)
            tmp_dict1 = {}
            tmp_dict1["join"] = {}
            tmp_dict1["join"]["record"] = {}
            tmp_dict1["join"]["static"] = {}
            tmp_dict1["update"] = {}
            tmp_dict1["update"]["record"] = {}
            tmp_dict1["update"]["static"] = {}
            self._layer_summary[delta_key] = tmp_dict1
            # init gradient
            tmp_dict2 = {}
            tmp_dict2["join"] = {}
            tmp_dict2["join"]["record"] = {}
            tmp_dict2["join"]["static"] = {}
            tmp_dict2["update"] = {}
            tmp_dict2["update"]["record"] = {}
            tmp_dict2["update"]["static"] = {}
            self._grad_summary[delta_key] = tmp_dict2
            # process data for join or update
            if self._args.get("join_pbtxt") != "null":
                self._process_delta_data(dest_join_file, delta_key, "join")
            if self._args.get("update_pbtxt") != "null":
                self._process_delta_data(dest_update_file, delta_key, "update")

    def _get_debug_data(self, delta_dir, stage, div_tag, tag_value):
        """
        According to the file folder, read all debug data part to one file

        Args:
            delta_dir: file folder to read.
            stage: join or update stage
            div_tag: source split flag
            tag_value: source tag lists

        Returns:
            None
        """
        data_path = os.path.join(delta_dir, stage)
        if not os.path.exists(data_path):
            return
        output_file = "{}/{}_parts".format(delta_dir, stage)
        fd = open(output_file, 'w+')
        file_lists = os.listdir(data_path)
        for file in file_lists:
            file_path = "{}/{}".format(data_path, file)
            file_open = open(file_path)
            lines = file_open.read().split('\n')
            line_limit = 0
            for line in lines:
                if not div_tag:
                    line_limit += 1
                    fd.write(line + '\n')
                else:
                    for each_source in tag_value:
                        source_tag = '"<' + div_tag + ":" + str(each_source) + '>"'
                        if source_tag not in line:
                            continue
                        line_limit += 1
                        fd.write(line + '\n')
                if line_limit > 500:
                    break
        return

    def _get_result(self):
        """
        Calculate the mean / variance / inactivation rate / mean of absolute value, etc

        Args:
            None

        Returns:
            None
        """
        logger.info("calculate values...")
        layer_data = self._layer_summary
        grad_data = self._grad_summary
        self._calc_measure_value(layer_data)
        self._calc_measure_value(grad_data)

    def _process_delta_data(self, delta_file, delta_key, stage):
        """
        Process each delta model dump data

        Args:
            delta_file: file which record one delta data
            delta_key: delta number
            stage: join or update stage

        Returns:
            None
        """
        logger.info("process_delta_data process delta:{}".format(delta_key))
        if not os.path.exists(delta_file):
            return
        fp = open(delta_file)
        lines = fp.readlines()
        for line in lines:
            line = line.strip()
            content = line.split("\t")
            for every in content[1:]:
                if every == '' or ' ' in every:
                    continue
                every_list = every.split(":")
                key = every_list[0]
                if key.isdigit():
                    continue
                values = every_list[1:]
                if "GRAD" not in key:
                    if key in self._layer_summary[delta_key][stage]["record"]:
                        self._layer_summary[delta_key][stage]["record"][key].append(values)
                    else:
                        self._layer_summary[delta_key][stage]["record"][key] = []
                        self._layer_summary[delta_key][stage]["record"][key].append(values)
                else:
                    if key in self._grad_summary[delta_key][stage]["record"]:
                        self._grad_summary[delta_key][stage]["record"][key].append(values)
                    else:
                        self._grad_summary[delta_key][stage]["record"][key] = []
                        self._grad_summary[delta_key][stage]["record"][key].append(values)
        fp.close()
        return

    def _handle_layer(self, delta, record, static, stage, layer, q):
        """
        Get statistical distribution datas

        Args:
            delta: which delta to calculate
            record: dict which save all the layer debug datas
            static: dict to save this layer static calculated datas
            stage: join or update stage
            q: multiprocessing.Queue()

        Returns:
            None
        """
        static[layer] = {}
        static[layer]["avg"] = 0
        static[layer]["var"] = 0
        static[layer]["zero"] = 0
        static[layer]["ab_avg"] = 0
        static[layer]["avg_detail"] = []
        static[layer]["neurons_num"] = 0
        static[layer]["sample_num"] = 0
        static[layer]["bucket_xy"] = []
        if not record[layer]:
            q.put(static)
            return
        tmp_list = []

        # number of layer sample
        sample_num = len(record[layer])
        # number of layer neurons
        neurons_num = int(record[layer][0][0])
        static[layer]["neurons_num"] = neurons_num
        static[layer]["sample_num"] = sample_num
        if neurons_num == 0:
            logger.info("number of {} neurons is 0".format(layer))
            q.put(static)
            return
        neurons_zero = []

        for i in range(neurons_num):
            neurons_zero.append(0)
            static[layer]["avg_detail"].append(0)
        for sample in record[layer]:
            sample_list = self._string_to_float(sample)
            sample_list_real = sample_list[1:]
            if len(sample_list_real) != neurons_num:
                logger.info("the number of {} neurons is different".format(layer))
                continue

            for i in range(len(sample_list_real)):
                static[layer]["avg_detail"][i] += sample_list_real[i]
                if sample_list_real[i] == 0:
                    neurons_zero[i] += 1
                else:
                    continue
            tmp_list = tmp_list + sample_list_real

        if tmp_list == []:
            logger.info("{} is empty".format(layer))
            q.put(static)
            return

        static[layer]["zero"] = float(neurons_zero.count(sample_num))/float(neurons_num)

        for i in range(neurons_num):
            static[layer]["avg_detail"][i] = float(static[layer]["avg_detail"][i])/float(sample_num)
        record_data = tmp_list
        record_data.sort()
        record_max = record_data[-1]
        record_min = record_data[0]

        bucket_xy = []
        bucket_num = 1000
        bucket_distance = (record_max + 0.01 - record_min)/bucket_num
        bucket_start = record_min
        for i in range(1, bucket_num):
            bucket_end = bucket_start + bucket_distance
            bucket_tmp = {}
            bucket_tmp["x"] = (bucket_start, bucket_end)
            bucket_tmp["y"] = 0
            for record_item in record_data:
                if record_item == 0 and 'GRAD' in layer:
                    continue
                if record_item >= bucket_start and record_item < bucket_end:
                    bucket_tmp["y"] += 1
            bucket_start = bucket_end
            bucket_xy.append(bucket_tmp)

        static[layer]["bucket_xy"] = bucket_xy
        static[layer]["avg"] = np.mean(record_data)
        static[layer]["var"] = np.var(record_data)
        ab_record = list(map(abs, record_data))
        static[layer]["ab_avg"] = np.mean(ab_record)
        q.put(static)

    def _calc_measure_value(self, data):
        """
        Calc measure value

        Args:
            data: which data to calculate measure values

        Returns:
            None
        """
        logger.info("calc_measure_value")
        delta_num_list = self._get_delta_num_list()
        for delta in delta_num_list:
            delta_key = "delta_" + str(delta)
            if delta_key not in data.keys():
                continue
            delta_layer_data = data[delta_key]

            for stage in ["join", "update"]:
                if stage == "join" and self._args.get("join_pbtxt") == "null":
                    continue
                if stage == "update" and self._args.get("update_pbtxt") == "null":
                    continue
                record = delta_layer_data[stage]["record"]
                static = delta_layer_data[stage]["static"]

                handle_async = True
                layer_process_lst = []
                q = multiprocessing.Queue()
                if record:
                    layer_cnt = 1
                    for layer in record.keys():
                        logger.info("{} {} {}/{} {}".format(delta_key, stage, layer_cnt, len(record.keys()), layer))
                        layer_cnt += 1
                        if not handle_async:
                            self._handle_layer(delta, record, static, stage, layer, q)
                        else:
                            p = multiprocessing.Process(target=self._handle_layer, args=(
                                delta, record, static, stage, layer, q))
                            p.start()
                            layer_process_lst.append(p)
                if handle_async:
                    layer_cnt = 1
                    for i in layer_process_lst:
                        layer_cnt += 1
                        static.update(q.get())
                        logger.info("get from queue {} {} {}/{}".format(delta_key,
                                    stage, layer_cnt, len(layer_process_lst)))

    def _string_to_float(self, list_data):
        """
        Convert string list to floating point number list

        Args:
            list_data: string list

        Returns:
            float array list
        """
        result = []
        for x in list_data:
            if x.isdigit():
                x = float(x)
                result.append(x)
        return result

    def _save_result(self, data):
        """
        Save result to local file

        Args:
            data: all delta datas which has all the calculated datas, to save to tmp file

        Returns:
            None
        """
        delta_num_list = self._get_delta_num_list()
        if not data:
            return
        for num in delta_num_list:
            delta_key = "delta_" + str(num)
            if delta_key not in data:
                continue
            cdata = data[delta_key]
            for stage in ["join", "update"]:
                if stage == "join" and self._args.get("join_pbtxt") == "null":
                    continue
                if stage == "update" and self._args.get("update_pbtxt") == "null":
                    continue
                static_data = cdata[stage]["static"]
                if not static_data:
                    continue
                for node_name in static_data.keys():
                    avg = static_data[node_name]["avg"]
                    var = static_data[node_name]["var"]
                    zero = static_data[node_name]["zero"]
                    ab_avg = static_data[node_name]["ab_avg"]
                    avg_detail = static_data[node_name]["avg_detail"]
                    neuron_num = static_data[node_name]["neurons_num"]
                    bucket_xy = static_data[node_name]["bucket_xy"]

                    if abs(avg) > FLOAT_MAX or abs(var) > FLOAT_MAX \
                            or abs(zero) > FLOAT_MAX or abs(ab_avg) > FLOAT_MAX:
                        logger.info("debug_static_info {}, {}, {}, {}, {},\
                                    {}, {}, {} are too large！".format(
                                    self._args["jobid"], num, stage, node_name,
                                    avg, var, zero, ab_avg))
                        avg = FLOAT_MIN if avg < FLOAT_MIN else avg
                        avg = FLOAT_MAX if avg > FLOAT_MAX else avg
                        var = FLOAT_MIN if var < FLOAT_MIN else var
                        var = FLOAT_MAX if var > FLOAT_MAX else var
                        zero = FLOAT_MIN if zero < FLOAT_MIN else zero
                        zero = FLOAT_MAX if zero > FLOAT_MAX else zero
                        ab_avg = FLOAT_MIN if ab_avg < FLOAT_MIN else ab_avg
                        ab_avg = FLOAT_MAX if ab_avg > FLOAT_MAX else ab_avg

                    content = "{}\t{}\t{}\t{}\t{}\t{}\t{}\n".format(num, stage, node_name, avg, zero, var, ab_avg)
                    save_static_dir = "output/" + "static.data"
                    with open(save_static_dir, 'a+') as f:
                        f.write(content)
                    detail_data = "{}\t{}\t{}\t{}\t{}\t{}\n".format(
                                  num, stage, node_name, neuron_num, bucket_xy, avg_detail)
                    save_detail_dir = "output/" + "detail.data"
                    with open(save_detail_dir, 'a+') as f:
                        f.write(detail_data)
                    if zero >= 0.9:
                        flag_zero = 1
                    else:
                        flag_zero = 0
                    if var >= 10000:
                        flag_var = 1
                    else:
                        flag_var = 0
                    if ab_avg >= 100:
                        flag_ab_avg = 1
                    else:
                        flag_ab_avg = 0

                    save_assessment_dir = "output/" + "assessment.data"
                    with open(save_assessment_dir, 'a+') as f:
                        if flag_zero or flag_var or flag_ab_avg:
                            res = "{}\t{}\t{}\t{}\t{}\t{}\n".format(num, stage, node_name,
                                                                    flag_zero, flag_var,
                                                                    flag_ab_avg)
                            f.write(res)
        logger.info("write statistical data done")
