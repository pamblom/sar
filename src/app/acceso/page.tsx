import { Suspense } from "react";
import AccesoPage from "./page-client";

export default function Page() {
  return (
    <Suspense>
      <AccesoPage />
    </Suspense>
  );
}
