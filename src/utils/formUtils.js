import isEqual from 'lodash/isEqual';
import isDate from 'lodash/isDate';

export const getDirtyValues = (original, current) => {
    const dirty = {};

    Object.keys(current).forEach((key) => {
        const originalVal = original[key];
        const currentVal = current[key];

        // Special handling for Arrays (Products, etc.)
        if (Array.isArray(currentVal)) {
            if (!Array.isArray(originalVal) || !isEqual(currentVal, originalVal)) {
                dirty[key] = currentVal;
            }
            return;
        }

        // Special handling for Dates (often come as Date objects or strings)
        if (isDate(currentVal) || isDate(originalVal)) {
            const d1 = isDate(originalVal) ? originalVal.getTime() : new Date(originalVal).getTime();
            const d2 = isDate(currentVal) ? currentVal.getTime() : new Date(currentVal).getTime();
            if ((d1 !== d2) && !(isNaN(d1) && isNaN(d2))) { // Avoid NaN !== NaN
                dirty[key] = currentVal;
            }
            return;
        }

        if (!isEqual(originalVal, currentVal)) {
            dirty[key] = currentVal;
        }
    });

    return dirty;
};
