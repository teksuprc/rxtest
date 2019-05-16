

class MemDB {

    constructor() {
        this.data = {};
    }

    getData() {
        return this.data;
    }

    hasKey(key) {
        return (key in this.data) ? true : false;
    }

    get(key) {
        return (key in this.data) ? this.data[key] : null;
    }

    set(key, obj) {
        if(!this.data[key]) {
            this.data[key] = obj;
        }
    }

    getKeys() {
        return Object.keys(this.data);
    }

    delete(key) {
        if(key in this.data) {
            this.data[key] = null;
            delete this.data[key];
        }
    }
}

let memdb = new MemDB();

module.exports = memdb;