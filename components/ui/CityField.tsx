"use client";

import { useMemo } from "react";
import { SelectField } from "@/components/ui/SelectField";
import { usePublicCities } from "@/hooks/usePublicCities";

type CityFieldProps = {
  value: string;
  onChange: (city: string) => void;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  className?: string;
};

/**
 * City picker for every business address form. It reads the same admin-managed list
 * as the catalogue filters, so a new city shows up here without any code change.
 */
export function CityField({ value, onChange, disabled = false, ...rest }: CityFieldProps) {
  const { data, isPending, isError } = usePublicCities();

  const options = useMemo(() => {
    const names = data ?? [];
    // Keep a saved city that was since deactivated visible, so editing never blanks it silently.
    const all = value !== "" && !names.includes(value) ? [value, ...names] : names;
    return all.map((name) => ({ value: name, label: name }));
  }, [data, value]);

  return (
    <SelectField
      {...rest}
      value={value}
      onChange={onChange}
      options={options}
      searchable
      disabled={disabled || (isPending && value === "")}
      placeholder={isPending ? "Duke ngarkuar…" : isError ? "Qytetet nuk u ngarkuan" : "Zgjidh qytetin"}
    />
  );
}
