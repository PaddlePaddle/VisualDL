/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Request, Response} from 'express';

const texts = [
    '不要以为抹消过去，重新来过，即可发生什么改变',
    '这只是谁也不会伤害到的，温柔的谎言。虽然听上去不时闪现着希望，实际上却是迂回地饱含着绝望的说法。可能做不到 这件事本身说话人自己也了然于心，而向众人留有回旋的余地。',
    '自称理解了能教他人什么的都太狂妄了 自以为理解了是罪与恶 虽然如此 我们不得不自欺欺人地活下去',
    '自己的过去会被当做笑话或者捏他的形式，被他人随随便便的共有化。最终只会被他和她们当做方便好用的交流素材， 快乐的使用着',
    '怎么办？没怎么办。只想就这件事随便说说而已。就好比，在电视里看到战争和贫困的场景，只能一边说着“真是可怜啊 ”“真是不得了啊”“这是我们无能为力的事情啊”，而同时我们在舒适的屋子里吃着好吃的晚饭的事情也没有改变。 我们无法在此之后着手做些什么，到最后不过只能想到“要对目前为止自己的幸福心怀感激”这种程度的事',
    '世上没有像一个模子刻出来样的恶人哦 平时大家都是善人 至少大家都是普通人 但是 一到紧要关头 就会突然变成恶人 所以很 可怕 因为不能大意 人不可轻信',
    '人类要是遇到真心害怕的事 完全不会在意别人 就算牺牲周围的人也要获救 只要暴露出这份丑陋的嘴脸 就再也无法好好相处了  不能逃避只是强身的想法 错的并不会总是自己 社会上 人世间 身边 总会有人做错 自己可以改变它 这只是顺应了这个垃圾一 般的冷酷且残酷的世界 承认自己的失败并顺从的行为 只是用漂亮话装饰起来 连自己都要欺骗罢了'
];

export default async (req: Request, res: Response) => {
    const index = (+req.query.index ?? 0) % texts.length;
    res.setHeader('Content-Type', 'text/plain');
    return texts[index];
};
