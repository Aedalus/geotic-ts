import { camelString } from './util/string-util';

export class EntityEvent {
    name: string
    handlerName: string
    data = {};
    prevented = false;
    handled = false;

    constructor(name: string, data = {}) {
        this.name = name;
        this.data = data;
        this.handlerName = camelString(`on ${this.name}`);
    }

    is(name: string) {
        return this.name === name;
    }

    handle() {
        this.handled = true;
        this.prevented = true;
    }

    prevent() {
        this.prevented = true;
    }
}
