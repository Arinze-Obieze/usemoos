export function cx(
  styles: Record<string, string>,
  ...classNames: Array<string | false | null | undefined>
) {
  return classNames
    .flatMap((className) => (className ? className.split(/\s+/) : []))
    .filter(Boolean)
    .map((className) => styles[className] ?? className)
    .join(" ");
}
