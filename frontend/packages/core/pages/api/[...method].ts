import mock from '@visualdl/mock';

const delay = Number.parseInt(process.env.DELAY || '', 10);

export default mock({delay: delay ? () => Math.random() * delay : 0});
