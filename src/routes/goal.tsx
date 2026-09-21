import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/goal")({
  component: () => <Navigate to="/goals" />,
});
