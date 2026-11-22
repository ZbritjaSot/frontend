"use client";

import { useId, useState } from "react";
import { VisibilityOutlinedIcon } from "@/components/ui/icons";
import { fieldLabel, input } from "@/lib/ui";

export function PasswordField({
  label,
  name,
  value,
  onChange,
  autoComplete,
  disabled,
  invalid,
  describedBy,
}: {
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className={fieldLabel}>
      <label htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id}
          className={input()}
          style={{ paddingRight: "2.75rem" }}
          type={visible ? "text" : "password"}
          name={name}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          required
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-65"
          aria-pressed={visible}
          aria-label={visible ? "Fshih fjalëkalimin" : "Shfaq fjalëkalimin"}
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
        >
          <VisibilityOutlinedIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}
