import { Clazz } from './Component';
import { camelString } from './util/string-util';

export class ComponentRegistry {
    _cbit = 0;
    _map : {[index: string]: Clazz<any>} = {};

    register<T>(clazz: Clazz<T>) {
        const key = camelString(clazz.name);

        clazz.prototype._ckey = key;
        clazz.prototype._cbit = BigInt(++this._cbit);

        this._map[key] = clazz;
    }

    get(key: string) {
        return this._map[key];
    }
}
