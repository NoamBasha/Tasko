import "./ScrollableDiv.css";
import { useState, useRef } from "react";

const ScrollableDiv = ({ className, children }) => {
    const scrollableDivRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);

    const handleMouseDown = (event) => {
        setIsDragging(true);
        setStartX(event.pageX - scrollableDivRef.current.scrollLeft);
    };

    const handleMouseMove = (event) => {
        if (isDragging) {
            const newScrollLeft = event.pageX - startX;
            if (scrollableDivRef.current) {
                scrollableDivRef.current.scrollLeft = newScrollLeft;
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const divClassName = `scrollable-div-container ${className || ""}`;

    return (
        <div
            className={divClassName}
            ref={scrollableDivRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {children}
        </div>
    );
};

export default ScrollableDiv;
