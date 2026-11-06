"use client";

import { useId, type ReactNode } from "react";

export type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  required?: true;
};

type FieldProps = {
  label: ReactNode;
  children: (control: FieldControlProps) => ReactNode;
  id?: string;
  hint?: ReactNode;
  error?: ReactNode;
  requirement?: "required" | "optional";
  className?: string;
};

export function FieldError({
  id,
  tone = "default",
  children,
}: {
  id: string;
  tone?: "default" | "inverse";
  children?: ReactNode;
}) {
  if (!children) return null;
  return (
    <p
      id={id}
      className={`m-0 text-sm font-semibold ${tone === "inverse" ? "text-[#ffb4b4]" : "text-danger"}`}
    >
      {children}
    </p>
  );
}

export function Field({
  label,
  children,
  id,
  hint,
  error,
  requirement,
  className,
}: FieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;

  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(" ");

  const control: FieldControlProps = {
    id: fieldId,
    ...(describedBy ? { "aria-describedby": describedBy } : {}),
    ...(error ? { "aria-invalid": true as const } : {}),
    ...(requirement === "required" ? { required: true as const } : {}),
  };

  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={fieldId} className="text-sm font-bold tracking-tight text-ink">
          {label}
          {requirement === "required" && (
            <span aria-hidden="true" className="text-accent-fg">
              {" "}
              *
            </span>
          )}
        </label>
        {requirement === "optional" && (
          <span className="text-xs font-semibold text-muted">Opsionale</span>
        )}
      </div>
      {children(control)}
      {hint && <p id={hintId} className="m-0 text-sm leading-normal text-muted">{hint}</p>}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
