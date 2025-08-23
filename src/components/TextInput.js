import React from "react";

const TextInput = ({ value, onChange, placeholder, onKeyDown }) => {
  return (
    <textarea
      className="form-control shadow-sm"
      rows="4"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown} // allows Enter handling
      style={{ resize: "none" }} // prevents ugly resizing
    />
  );
};

export default TextInput;
