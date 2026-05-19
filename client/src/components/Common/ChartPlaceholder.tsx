export function ChartPlaceholder({ message }: { message: string }) {
  return (
    <div className="h-[250px] w-full flex items-center justify-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
