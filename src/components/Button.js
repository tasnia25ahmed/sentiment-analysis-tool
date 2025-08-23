import React from "react";

const Button = ({ onClick, children, className = "", variant = "primary", size = "md" }) => {
  // Map size prop to Bootstrap size classes
  const sizeClass = size === "lg" ? "btn-lg" : size === "sm" ? "btn-sm" : "";

  return (
    <button
      className={`btn btn-${variant} ${sizeClass} ${className} shadow-sm rounded-pill`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;

