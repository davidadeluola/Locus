import { useEffect } from "react";

/**
 * Attaches mouse move listener to an element for cursor-tracking glow effect
 * Sets CSS custom properties --hover-x and --hover-y based on mouse position
 * @param {HTMLElement} element - The DOM element to attach the listener to
 * @returns {Function} Cleanup function to remove the event listener
 */
export const attachMouseGlow = (element) => {
  if (!element) return () => {};

  const handleMouseMove = (event) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    element.style.setProperty("--hover-x", `${x}px`);
    element.style.setProperty("--hover-y", `${y}px`);
  };

  element.addEventListener("mousemove", handleMouseMove);
  return () => {
    element.removeEventListener("mousemove", handleMouseMove);
  };
};

/**
 * Custom hook to handle cursor-tracking glow effect on a single ref
 * @param {React.RefObject} ref - Reference to the element to attach the effect to
 */
export const useMouseGlow = (ref) => {
  useEffect(() => {
    if (!ref.current) return;
    return attachMouseGlow(ref.current);
  }, [ref]);
};
