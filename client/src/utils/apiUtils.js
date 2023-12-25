export const handleApiError = (error) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const { status, data } = error.response;
        console.error(`Server responded with error ${status}:`, data);
        throw new Error(data.message || "Server error");
    } else if (error.request) {
        // The request was made, but no response was received
        console.error("No response received from the server");
        throw new Error("No response from the server");
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Request setup error:", error.message);
        throw new Error("Request setup error");
    }
};
