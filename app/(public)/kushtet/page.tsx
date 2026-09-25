import type { Metadata } from "next";
import { Band } from "@/features/public/Frame";
import { display, kicker } from "@/features/public/tone";

export const metadata: Metadata = {
  title: "Kushtet",
  description: "Si përdoret ZbritjaSot kur shikon një ofertë.",
};

const points = [
  {
    title: "Çfarë liston faqja",
    body: "ZbritjaSot liston zbritjet që i vendosin dyqanet. Nuk shet produkte dhe nuk merr porosi.",
  },
  {
    title: "Çmimi te dyqani",
    body: "Çmimi në faqe mund të ndryshojë te dyqani. Çmimi që vlen është ai që e jep dyqani kur blen.",
  },
  {
    title: "Kush përgjigjet për ofertën",
    body: "Dyqani përgjigjet për ofertën e vet: për produktin, çmimin dhe afatin.",
  },
  {
    title: "Pa llogari",
    body: "Një vizitor nuk ka nevojë për llogari që të shohë ofertat.",
  },
];

export default function TermsPage() {
  return (
    <Band className="pt-8">
      <p className={kicker}>ZbritjaSot</p>
      <h1 className={`m-0 mt-2 text-[clamp(2.4rem,6vw,4rem)] ${display}`}>Kushtet</h1>
      <div className="mt-10 max-w-2xl space-y-8">
        {points.map((point) => (
          <section key={point.title}>
            <h2 className="m-0 text-xl font-extrabold tracking-tight">{point.title}</h2>
            <p className="mt-2 mb-0 text-sm leading-relaxed text-muted">{point.body}</p>
          </section>
        ))}
      </div>
    </Band>
  );
}
