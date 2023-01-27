import * as _ from 'lodash';

export default function clone<T>(obj: T, manipulator: (c: T) => void): T {
    const cloned = _.clone(obj);
    manipulator(cloned);
    return cloned;
}
