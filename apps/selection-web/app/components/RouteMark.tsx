export function RouteMark({ route }: { route: "A" | "B" | "C" }) {
  return <span className={`route-mark route-${route.toLowerCase()}`}>{route}</span>;
}
