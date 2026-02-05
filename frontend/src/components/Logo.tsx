export function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <img
      src="https://neuromat.numec.prp.usp.br/static/img/amparo.jpg"
      alt="Logo AMPARO"
      className={`object-contain ${className}`}
    />
  );
}
