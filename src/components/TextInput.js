import React from "react";

const TextInput = ({ value, onChange, placeholder }) => {
  return (
    <textarea
      className="textarea"
      rows="4"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

export default TextInput;
