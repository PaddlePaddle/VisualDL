import NotificationItem from './NotificationItem';

let seed = 1;
// instances
const instances = [];

/**
 * caculate top dist
 *
 * @param {number} topDist top dist
 * @return {number} final top dist
 */
function calcTopDist(topDist = 16) {
    for (let i = 0, len = instances.length; i < len; i++) {
        topDist += (instances[i].vm.el.offsetHeight + 16);
    }
    return topDist;
}

/**
 * Notification main func
 *
 * @param {Object} options options
 * @return {NotificationItem} instance
 */
const notification = function (options = {}) {
    options.top = calcTopDist(options.offset);
    const {onClose, onClick} = options;
    delete options.onClick;
    delete options.onClose;
    delete options.offset;
    const instance = {
        vm: new NotificationItem({
            data: options
        }),
        id: `notification_${seed++}`
    };

    if (typeof onClick === 'function') {
        instance.vm.on('itemClick', onClick);
    }
    instance.vm.on('close', () => {
        notification.close(instance.id, onClose);
    });
    instance.vm.attach(document.body);

    instances.push(instance);
    return instance.vm;
};

/**
 * close
 *
 * @param {string} id instance id
 * @param {Function} onClose cusmtom func
 */
notification.close = function (id, onClose) {
    let index;
    let removedHeight;
    let len = instances.length;
    for (let i = 0; i < len; i++) {
        if (id === instances[i].id) {
            if (typeof onClose === 'function') {
                onClose(instances[i]);
            }
            index = i;
            removedHeight = instances[i].vm.el.offsetHeight;
            // distroy instance
            instances[i].vm.dispose();
            instances[i] = null;
            // reomve instance fron instances
            instances.splice(i, 1);
            break;
        }
    }
    // change the left notification's height
    if (len > 1) {
        for (let i = index; i < len - 1; i++) {
            instances[i].vm.el.style.top = `${parseInt(instances[i].vm.el.style.top, 10) - removedHeight - 16}px`;
        }
    }

};

// fout type func
['success', 'warning', 'info', 'error'].forEach(type => {
    notification[type] = options => {
        if (typeof options === 'string') {
            options = {
                message: options
            };
        }
        options = options || {};
        options.type = type;
        return notification(options);
    };
});

export default notification;
