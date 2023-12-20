import { useState } from "react";

const useLocalStorage = (key, initialValue) => {
    const [value, setValue] = useState(() => {
        try {
            const value = localStorage.getItem(key);
            if (value) {
                return JSON.parse(value);
            } else {
                localStorage.setItem(key, JSON.stringify(initialValue));
                return initialValue;
            }
        } catch (error) {
            localStorage.setItem(key, JSON.stringify(initialValue));
            return initialValue;
        }
    });

    const setStateValue = (valueOrFn) => {
        let newValue;
        if (typeof valueOrFn === "function") {
            const fn = valueOrFn;
            newValue = fn(value);
        } else {
            newValue = valueOrFn;
        }
        localStorage.setItem(key, JSON.stringify(newValue));
        setValue(newValue);
    };
    return [value, setStateValue];
};

export default useLocalStorage;
