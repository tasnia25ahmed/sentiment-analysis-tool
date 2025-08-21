import React from "react";
debugger;
const Button = ({ onClick, children, className }) => {
  return (
    <button
      className={"button mx-2 " + className}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
