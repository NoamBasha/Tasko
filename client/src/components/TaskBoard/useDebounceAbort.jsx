const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

const useDebounceAbort = (func, initialData, debounceTime = 1000) => {
    const [promise, setPromise] = useState(null);
    const [data, setData] = useState(initialData);

    useEffect(() => {
        if (promise !== null) {
            promise.abort();
            setPromise(null);
        }
        debouncedFunc(data);
    }, [data]);

    const funcWithPromise = () => {
        const promise = func(data);
        setPromise(promise);
    };

    const debouncedFunc = useCallback(
        debounce(() => funcWithPromise(), debounceTime),
        []
    );

    return [setData];
};

export default useDebounceAbort;
