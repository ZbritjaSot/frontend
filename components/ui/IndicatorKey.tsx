"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import StarIcon from "@mui/icons-material/Star";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { offerStatusClass } from "@/lib/ui";

export type IndicatorMark =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "taken_down"
  | "expired"
  | "active"
  | "inactive"
  | "disabled"
  | "view"
  | "edit"
  | "send"
  | "add"
  | "delete"
  | "approve"
  | "main"
  | "lock"
  | "unlock"
  | "drag"
  | "star"
  | "branches"
  | "history"
  | "count-danger"
  | "count-pending"
  | "problem";

export type IndicatorItem = {
  mark: IndicatorMark;
  text: string;
  count?: number;
};

const iconBox =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-sunken text-ink";

const countBox =
  "inline-flex h-[1.35rem] min-w-[1.35rem] shrink-0 items-center justify-center rounded-full px-1.5 text-[0.6875rem] leading-none font-extrabold text-charcoal";

const pill = "mt-0! self-center!";

function countLabel(count: number | undefined): string {
  const value = count ?? 0;
  return value > 99 ? "99+" : String(value);
}

function Mark({ mark, count }: { mark: IndicatorMark; count?: number }) {
  switch (mark) {
    case "draft":
      return <span className={`${offerStatusClass("draft")} ${pill}`}>Draft</span>;
    case "pending":
      return (
        <span className={`${offerStatusClass("pending")} ${pill}`}>Në pritje</span>
      );
    case "approved":
      return (
        <span className={`${offerStatusClass("approved")} ${pill}`}>Aprovuar</span>
      );
    case "rejected":
      return (
        <span className={`${offerStatusClass("rejected")} ${pill}`}>Refuzuar</span>
      );
    case "taken_down":
      return (
        <span className={`${offerStatusClass("taken_down")} ${pill}`}>Hequr</span>
      );
    case "expired":
      return (
        <span className={`${offerStatusClass("expired")} ${pill}`}>Skaduar</span>
      );
    case "active":
      return (
        <span className={`${offerStatusClass("approved")} ${pill}`}>Aktive</span>
      );
    case "inactive":
      return (
        <span className={`${offerStatusClass("rejected")} ${pill}`}>Joaktive</span>
      );
    case "disabled":
      return (
        <span className={`${offerStatusClass("rejected")} ${pill}`}>
          Çaktivizuar
        </span>
      );
    case "view":
      return (
        <span className={iconBox}>
          <VisibilityOutlinedIcon fontSize="small" />
        </span>
      );
    case "edit":
      return (
        <span className={iconBox}>
          <EditOutlinedIcon fontSize="small" />
        </span>
      );
    case "send":
      return (
        <span className={iconBox}>
          <SendOutlinedIcon fontSize="small" className="text-accent!" />
        </span>
      );
    case "add":
      return (
        <span className={iconBox}>
          <AddOutlinedIcon fontSize="small" className="text-accent!" />
        </span>
      );
    case "delete":
      return (
        <span className={iconBox}>
          <DeleteOutlinedIcon fontSize="small" className="text-danger!" />
        </span>
      );
    case "approve":
      return (
        <span className={iconBox}>
          <CheckOutlinedIcon fontSize="small" className="text-accent!" />
        </span>
      );
    case "main":
      return (
        <span className={iconBox}>
          <HomeOutlinedIcon fontSize="small" />
        </span>
      );
    case "lock":
      return (
        <span className={iconBox}>
          <LockOutlinedIcon fontSize="small" />
        </span>
      );
    case "unlock":
      return (
        <span className={iconBox}>
          <LockOpenOutlinedIcon fontSize="small" className="text-accent!" />
        </span>
      );
    case "drag":
      return (
        <span className={iconBox}>
          <DragIndicatorIcon fontSize="small" />
        </span>
      );
    case "star":
      return (
        <span className={iconBox}>
          <StarIcon fontSize="small" className="text-accent!" />
        </span>
      );
    case "branches":
      return (
        <span className={iconBox}>
          <ExpandMoreIcon fontSize="small" />
        </span>
      );
    case "history":
      return (
        <span className={iconBox}>
          <HistoryOutlinedIcon fontSize="small" />
        </span>
      );
    case "count-danger":
      return (
        <span className={`${countBox} bg-danger-soft`}>{countLabel(count)}</span>
      );
    case "count-pending":
      return (
        <span className={`${countBox} bg-pending`}>{countLabel(count)}</span>
      );
    case "problem":
      return (
        <span
          className="inline-block h-8 w-1 shrink-0 rounded-full bg-danger"
          aria-hidden
        />
      );
    default:
      return null;
  }
}

export function IndicatorKey({ items }: { items: IndicatorItem[] }) {
  return (
    <section aria-label="Çelësi" className="mb-6">
      <p className="m-0 mb-2.5 flex items-center gap-2 text-[0.6875rem] font-extrabold tracking-[0.18em] text-accent uppercase">
        <span className="size-1.5 rounded-full bg-accent" aria-hidden />
        Çelësi
      </p>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {items.map((item) => (
          <li
            key={`${item.mark}-${item.text}`}
            className="flex max-w-full items-center gap-2.5 rounded-xl border border-line bg-elevated py-1.5 pr-3.5 pl-1.5"
          >
            <Mark mark={item.mark} count={item.count} />
            <span className="text-sm leading-snug text-ink">{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export const bizOfferKey: IndicatorItem[] = [
  { mark: "draft", text: "Ende nuk është dërguar." },
  { mark: "pending", text: "Pret aprovimin." },
  { mark: "approved", text: "Mund të dalë në faqen publike." },
  { mark: "taken_down", text: "Është hequr nga faqja publike." },
  { mark: "expired", text: "Data ka kaluar. Nuk shfaqet." },
  { mark: "view", text: "Hap dosjen." },
  { mark: "edit", text: "Ndrysho. Vetëm draft." },
  { mark: "send", text: "Dërgo për aprovim." },
  { mark: "delete", text: "Fshi dosjen." },
];

export const bizOfferDetailKey: IndicatorItem[] = [
  { mark: "draft", text: "Ende nuk është dërguar." },
  { mark: "pending", text: "Pret aprovimin." },
  { mark: "approved", text: "Mund të dalë në faqen publike." },
  { mark: "taken_down", text: "Është hequr nga faqja publike." },
  { mark: "expired", text: "Data ka kaluar. Nuk shfaqet." },
];

export function bizHomeKey(waitingCount: number): IndicatorItem[] {
  return [
  {
    mark: "count-pending",
    count: waitingCount,
    text: "Sa dosje presin aprovim. I njëjti numër te Ofertat.",
  },
  { mark: "active", text: "Abonimi lejon ofertat publike." },
  { mark: "pending", text: "Abonimi ende s’ka filluar." },
  { mark: "expired", text: "Abonimi ka mbaruar. Duhet rinovim." },
  { mark: "disabled", text: "Abonimi është ndalur nga administrata." },
];
}

export const bizProfileKey: IndicatorItem[] = [
  { mark: "active", text: "Biznesi mund të ketë oferta publike." },
  { mark: "inactive", text: "Biznesi është i ndalur. Ofertat nuk dalin." },
  { mark: "pending", text: "Abonimi ende s’ka filluar." },
  { mark: "expired", text: "Abonimi ka mbaruar." },
  { mark: "disabled", text: "Abonimi është ndalur nga administrata." },
];

export function adminHomeKey(
  pendingCount: number,
  addressCount: number,
  expiredCount: number,
): IndicatorItem[] {
  return [
    {
      mark: "count-pending",
      count: pendingCount,
      text: "Dosje që presin aprovim. I njëjti numër te Ofertat.",
    },
    {
      mark: "count-pending",
      count: addressCount,
      text: "Adresa që presin aprovim. Hap biznesin te Bizneset.",
    },
    {
      mark: "count-danger",
      count: expiredCount,
      text: "Abonime të skaduara. I njëjti numër te Abonimet.",
    },
  ];
}

export const adminOfferKey: IndicatorItem[] = [
  { mark: "draft", text: "Biznesi ende s’e ka dërguar." },
  { mark: "pending", text: "Ende s’është vendosur." },
  { mark: "approved", text: "E aprovuar. Mund të dalë publike." },
  { mark: "taken_down", text: "Është hequr nga faqja publike." },
  { mark: "expired", text: "Data ka kaluar." },
  { mark: "view", text: "Hap dosjen." },
];

export const adminOfferBoardKey: IndicatorItem[] = [
  ...adminOfferKey,
  { mark: "star", text: "Dyqani është ekskluziv." },
  { mark: "approve", text: "Aprovo dosjen (edhe ato te menaxheri)." },
];

export const adminInspectKey: IndicatorItem[] = [
  { mark: "pending", text: "Pret vendimin tënd." },
  { mark: "approved", text: "Është në faqen publike, nëse abonimi është aktiv." },
  { mark: "taken_down", text: "Është hequr nga faqja publike." },
  { mark: "expired", text: "Data ka kaluar." },
  { mark: "draft", text: "Biznesi ende s’e ka dërguar." },
  { mark: "edit", text: "Ndrysho dosjen para se ta aprovosh." },
];

export const adminBusinessKey: IndicatorItem[] = [
  { mark: "active", text: "Biznesi mund të ketë oferta publike." },
  { mark: "inactive", text: "Ofertat e tij nuk shfaqen." },
  { mark: "pending", text: "Adresa e re pret aprovim." },
  { mark: "pending", text: "Degë që pret aprovim." },
  { mark: "branches", text: "Hap degët e kompanisë." },
  { mark: "star", text: "Bëje ekskluzive." },
  { mark: "edit", text: "Ndrysho të dhënat." },
  { mark: "lock", text: "Çaktivizo biznesin." },
  { mark: "unlock", text: "Aktivizo biznesin." },
];

export const adminManagerKey: IndicatorItem[] = [
  { mark: "pending", text: "Fletushka që pret aprovimin tënd." },
  { mark: "edit", text: "Ndrysho dyqanet e menaxherit." },
  { mark: "delete", text: "Fshi llogarinë. Jo kur ka fletushka në pritje." },
];

export const adminNewsletterKey: IndicatorItem[] = [
  { mark: "delete", text: "Hiq adresën nga lista." },
  { mark: "delete", text: "Hiq një zgjedhje nga emaili." },
];

export const adminCurationKey: IndicatorItem[] = [
  { mark: "drag", text: "Tërhiq për ta renditur." },
  { mark: "add", text: "Shto në listë." },
  { mark: "delete", text: "Hiq nga lista." },
];

export const adminBranchKey: IndicatorItem[] = [
  { mark: "active", text: "Degë e aprovuar." },
  { mark: "inactive", text: "E ndalur. Nuk del publike." },
  { mark: "pending", text: "Pret aprovimin e administratës." },
  { mark: "approve", text: "Aprovo degën." },
  { mark: "main", text: "Bëje këtë lokacion kryesor." },
  { mark: "delete", text: "Fshi vetëm këtë degë." },
  { mark: "add", text: "Shto një degë." },
];

export const bizBranchKey: IndicatorItem[] = [
  { mark: "active", text: "Degë e aprovuar." },
  { mark: "inactive", text: "E ndalur. Nuk del publike." },
  { mark: "pending", text: "Pret aprovimin e administratës." },
  { mark: "add", text: "Shto një degë. Ajo pret aprovimin." },
];

export const mailResendKey: IndicatorItem[] = [
  { mark: "send", text: "Ridërgo këtë email." },
];

export const adminCategoryKey: IndicatorItem[] = [
  { mark: "active", text: "Kategoria duket te bizneset." },
  { mark: "inactive", text: "Kategoria është e fshehur." },
  { mark: "drag", text: "Tërhiq për ta renditur." },
  { mark: "edit", text: "Ndrysho emrin." },
  { mark: "lock", text: "Çaktivizo." },
  { mark: "unlock", text: "Aktivizo." },
  { mark: "delete", text: "Fshi kategorinë." },
];

export const adminSubscriptionKey: IndicatorItem[] = [
  { mark: "active", text: "Abonimi lejon ofertat publike." },
  { mark: "pending", text: "Ende s’ka filluar." },
  { mark: "expired", text: "Ka mbaruar. Ofertat nuk dalin." },
  { mark: "disabled", text: "E ndalur. Ofertat nuk dalin." },
  { mark: "history", text: "Hap abonimet e mëparshme." },
  { mark: "lock", text: "Çaktivizo abonimin." },
  { mark: "unlock", text: "Aktivizo abonimin." },
];
