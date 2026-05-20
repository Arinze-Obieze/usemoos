import { Label } from "@/components/ui/label";

interface FieldProps {
  label: string;
  id: string;
  helper?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}

export function Field({ label, id, helper, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5 mb-3.5">
      <div className="flex justify-between items-center">
        <Label htmlFor={id}>{label}</Label>
        {helper && (
          <span className="font-mono text-[11px] text-muted">{helper}</span>
        )}
      </div>
      {children}
      {error && (
        <span className="font-mono text-[11.5px] text-danger">{error}</span>
      )}
    </div>
  );
}
