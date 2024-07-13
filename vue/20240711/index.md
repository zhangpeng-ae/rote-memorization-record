# Promise

# 事件循环(event loop) 和 任务队列(task queue)

# 性能优化

# 手写代码

```javascript

function throttle(fn,wait){
  let timer = null;
  let flag = true
  return function (...args){
    if(!flag){
      return;
    }
    flag = false;
    timer = setTimeout(() => {
      fn.apply(this,args)
      flag = true;
    },wait)
  }
}

```
