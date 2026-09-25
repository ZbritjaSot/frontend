import type { Metadata } from "next";
import { Band } from "@/features/public/Frame";
import { display, kicker } from "@/features/public/tone";

export const metadata: Metadata = {
  title: "Privatësia",
  description: "Si e trajton ZbritjaSot një vizitor të faqes.",
};

const points = [
  {
    title: "Kush e mban faqen",
    body: "ZbritjaSot e mban këtë faqe. Ajo tregon zbritjet e dyqaneve lokale në Kosovë.",
  },
  {
    title: "Pa llogari për vizitorin",
    body: "Një vizitor nuk ka llogari. Nuk kërkohet regjistrim për të parë ofertat, fletushkat ose dyqanet.",
  },
  {
    title: "Hapja e një oferte",
    body: "Kur hap një ofertë, serveri ynë e numëron atë hapje. Nuk vendoset cookie gjurmimi dhe nuk ruhet adresa e pajisjes.",
  },
  {
    title: "Cookie e hyrjes",
    body: "Cookie e hyrjes përdoret vetëm për panelin e dyqanit dhe panelin e administratorit. Faqet publike nuk e kërkojnë.",
  },
];

export default function PrivacyPage() {
  return (
    <Band className="pt-8">
      <p className={kicker}>ZbritjaSot</p>
      <h1 className={`m-0 mt-2 text-[clamp(2.4rem,6vw,4rem)] ${display}`}>Privatësia</h1>
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
