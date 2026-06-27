import { redirect } from "next/navigation";

export default function Home() {
  // Auth akışı eklenene kadar doğrudan uygulama kabuğuna yönlendir.
  redirect("/dashboard");
}
