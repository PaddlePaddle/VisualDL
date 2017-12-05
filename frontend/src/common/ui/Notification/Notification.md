
## Notification

### base usage

```san Notification
   <template>
    <div>
        <san-button
            variants="raised info"
            on-click="handleClick01">
            auto close
        </san-button>
        <san-button
            variants="raised info"
            on-click="handleClick02">
            no auto close
        </san-button>
    </div>
</template>

<script>
import Notification from '../src/Notification';
import '../src/Notification/Notification.styl';
import Button from '../src/Button';
import '../src/Button/Button.styl';

export default {
    components: {
        'san-button': Button
    },
    // auto close
    handleClick01() {
        Notification({
            message: 'welcome',
            title: 'success'
        })
    },
    // no auto close
    handleClick02() {
        Notification({
            message: 'welcome',
            title: 'success',
            duration: 0
        })
    }
}
</script>
```

### with icon

```san Notification
<template>
    <div>
        <san-button
            variants="raised info"
            on-click="handleClick01">
            success
        </san-button>
        <san-button
            variants="raised info"
            on-click="handleClick02">
            warning
        </san-button>
        <san-button
            variants="raised info"
            on-click="handleClick03">
            info
        </san-button>
        <san-button
            variants="raised info"
            on-click="handleClick04">
            error
        </san-button>
        <san-button
            variants="raised info"
            on-click="handleClick05">
            simplify
        </san-button>
    </div>
</template>

<script>
import Notification from '../src/Notification';
import '../src/Notification/Notification.styl';
import Button from '../src/Button';
import '../src/Button/Button.styl';

export default {
    components: {
        'san-button': Button
    },
    handleClick01() {
        Notification({
            message: 'welcome',
            title: 'success',
            type: 'success'
        })
    },
    handleClick02() {
        Notification({
            message: 'warning',
            title: 'warning',
            type: 'warning'
        })
    },
    handleClick03() {
        Notification({
            message: 'info',
            title: 'info',
            type: 'info'
        })
    },
    handleClick04() {
        Notification({
            message: '不可以攻击己方水晶',
            title: '错误',
            type: 'error'
        })
    },
     handleClick05() {
         Notification.success('simplify')
     }
}
</script>
```
### width offset

```san Notification
<template>
    <div>
        <san-button
            variants="raised info"
            on-click="handleClick01">
            width offset
        </san-button>
    </div>
</template>

<script>
import Notification from '../src/Notification';
import '../src/Notification/Notification.styl';
import Button from '../src/Button';
import '../src/Button/Button.styl';

export default {
    components: {
        'san-button': Button
    },
    handleClick01() {
        Notification({
            message: 'offset 100px',
            title: 'success',
            offset:100
        })
    }
}
</script>
```


## API

### Props

| name | type | fefault | desc |
| --- | --- | --- | --- |
| title | String |  | title |
| message | String |  | content |
| customClass |String| | custom class |
| offset | Number |  | offset to the top |
| onClick | Function |  | on-click callback |
| onClose | Function |  | on-close callback |
| duration | Number | 3000 | duration |
| type | String | | include success,error,warning,info, others not use |



