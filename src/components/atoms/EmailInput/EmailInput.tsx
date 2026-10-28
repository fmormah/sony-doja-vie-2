"use client";

import classNames from "classnames";
import React from "react";

import Button from "@/components/atoms/Button";

export interface EmailInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (email: string) => void;
  onClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  onSubmit,
  onClick,
  placeholder = "email@domain.com",
  disabled = false,
  className,
}) => {
  const [internalValue, setInternalValue] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const isControlled = value !== undefined;
  const effectiveValue = isControlled ? value : internalValue;

  const isValidEmail = (text: string) => {
    const v = text.trim();
    if (!v) return false;
    // Basic but practical email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v);
  };

  const isValid = isValidEmail(effectiveValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setTouched(true);
    if (!isValid) return;
    onSubmit?.(effectiveValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <div
      className={classNames(
        "EmailInput",
        { "EmailInput--error": touched && !isValid },
        className,
      )}
    >
      <span className="EmailInput__icon" aria-hidden>
        @
      </span>
      <input
        type="email"
        className="EmailInput__field"
        value={effectiveValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Email address"
        aria-invalid={touched && !isValid}
      />
      <Button
        className="EmailInput__submit"
        iconOnly
        iconSrc="/assets/images/icons/send.svg"
        aria-label="Submit email"
        label={"" as unknown as string}
        onClick={() => {
          onClick?.();
          handleSubmit();
        }}
        disabled={disabled || !isValid}
      />
    </div>
  );
};

export default EmailInput;
