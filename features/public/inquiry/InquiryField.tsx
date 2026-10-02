import type { ComponentProps, ReactNode } from "react";
import {
  inquiryField,
  inquiryInput,
  inquiryLabel,
  inquiryLabelRow,
  inquiryOptional,
  inquiryTextarea,
} from "@/features/public/inquiry/styles";

type InquiryFieldProps = {
  label: string;
  required?: boolean;
  htmlFor: string;
  children: ReactNode;
};

export function InquiryField({ label, required = false, htmlFor, children }: InquiryFieldProps) {
  return (
    <div className={inquiryField}>
      <div className={inquiryLabelRow}>
        <label htmlFor={htmlFor} className={inquiryLabel}>
          {label}
          {required ? <span className="text-accent"> *</span> : null}
        </label>
        {!required ? <span className={inquiryOptional}>Opsionale</span> : null}
      </div>
      {children}
    </div>
  );
}

type InquiryInputProps = ComponentProps<"input"> & {
  invalid?: boolean;
};

export function InquiryInput({ invalid, className = "", ...props }: InquiryInputProps) {
  return (
    <input
      className={`${inquiryInput} ${invalid ? "border-danger focus:border-danger focus:ring-danger/25" : ""} ${className}`.trim()}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

type InquiryTextareaProps = ComponentProps<"textarea"> & {
  invalid?: boolean;
};

export function InquiryTextarea({ invalid, className = "", ...props }: InquiryTextareaProps) {
  return (
    <textarea
      className={`${inquiryTextarea} ${invalid ? "border-danger focus:border-danger focus:ring-danger/25" : ""} ${className}`.trim()}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
