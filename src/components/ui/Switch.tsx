import { forwardRef } from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  description?: string;
  className?: string;
  id?: string;
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      onChange,
      disabled = false,
      size = "md",
      label,
      description,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: {
        switch: "h-5 w-9",
        thumb: "h-4 w-4",
        translate: "translate-x-4",
      },
      md: {
        switch: "h-6 w-11",
        thumb: "h-5 w-5",
        translate: "translate-x-5",
      },
      lg: {
        switch: "h-7 w-14",
        thumb: "h-6 w-6",
        translate: "translate-x-7",
      },
    };

    const currentSize = sizeClasses[size];

    const handleClick = () => {
      if (!disabled) {
        onChange(!checked);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        handleClick();
      }
    };

    const switchComponent = (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        id={id}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative inline-flex ${currentSize.switch} items-center rounded-full
          transition-colors duration-200 ease-in-out focus:outline-none
          focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          ${
            checked
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-200 hover:bg-gray-300"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${className}
        `}
        {...props}
      >
        <span className="sr-only">
          {label || (checked ? "Activado" : "Desactivado")}
        </span>
        <span
          className={`
            ${currentSize.thumb} inline-block rounded-full bg-white shadow-lg
            transform transition-transform duration-200 ease-in-out
            ${checked ? currentSize.translate : "translate-x-0.5"}
          `}
        />
      </button>
    );

    if (label || description) {
      return (
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-6">{switchComponent}</div>
          <div className="flex-1">
            {label && (
              <label
                htmlFor={id}
                className={`text-sm font-medium text-gray-900 ${
                  disabled ? "opacity-50" : "cursor-pointer"
                }`}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      );
    }

    return switchComponent;
  }
);

Switch.displayName = "Switch";

export default Switch;
