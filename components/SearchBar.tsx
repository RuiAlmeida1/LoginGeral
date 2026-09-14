import { Search } from "lucide-react";
export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="search">
      <Search size={17} aria-hidden="true" />
      <input
        type="search"
        aria-label="Pesquisar aplicações"
        placeholder="Pesquisar aplicações..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <kbd>/</kbd>
    </label>
  );
}
