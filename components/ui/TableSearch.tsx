import SearchIcon from "@mui/icons-material/Search";

export function TableSearch({
  value,
  onChange,
  label,
  submitOnEnter = false,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  submitOnEnter?: boolean;
}) {
  return (
    <label className="relative block border-b border-line">
      <span className="sr-only">{label}</span>
      <SearchIcon
        fontSize="small"
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
      />
      <input
        type={submitOnEnter ? "search" : "text"}
        enterKeyHint={submitOnEnter ? "search" : undefined}
        autoComplete={submitOnEnter ? "off" : undefined}
        className="h-12 w-full appearance-none border-0 bg-transparent pr-4 pl-11 text-sm font-medium text-ink outline-none placeholder:text-muted focus-visible:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent/55"
        value={value}
        placeholder=""
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
