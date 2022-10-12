class EventEmitter {
    listeners = {}

    addListener(eventName, fn) {
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName].push(fn);
        return this;
    }

    removeListener (eventName, fn) {
        const lis = this.listeners[eventName];
        if (!lis) return this;
        for(let i = lis.length; i > 0; i--) {
            if (lis[i] === fn) {
                lis.splice(i,1);
                break;
            }
        }
        return this;
    }


    emit(eventName, ...args) {
        const fns = this.listeners[eventName];
        if (!fns) return false;
        fns.forEach((f) => {
            f(...args);
        });
        return true;
    }
}

export {EventEmitter}