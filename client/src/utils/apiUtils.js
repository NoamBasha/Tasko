export const handleApiError = (error) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const { data } = error.response;
        throw new Error(data.message || "Server error");
    } else if (error.request) {
        // The request was made, but no response was received
        throw new Error("No response from the server");
    } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error("Request setup error");
    }
};
