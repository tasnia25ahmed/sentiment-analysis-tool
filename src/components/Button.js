import React from "react";

const Button = ({ onClick, children, className }) => {
  return (
    <button
      className={"button " + className}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
