import { Btn } from "@/components/Ui";

export default function NotFound() {
  return (
    <section className="container-x pt-40 pb-32 md:pt-56">
      <p className="eyebrow mb-4">404</p>
      <h1 className="h1">This page took a day off.</h1>
      <p className="lead mt-6 text-muted">Unlike our automations.</p>
      <div className="mt-10"><Btn href="/">Back to home</Btn></div>
    </section>
  );
}
