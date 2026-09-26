"use client";

import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { useEffect, useState, type FormEvent } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { TableSearch } from "@/components/ui/TableSearch";
import {
  NEWSLETTER_PAGE_SIZE,
  type NewsletterPick,
  type NewsletterSubscriber,
} from "@/features/admin/newsletterApi";
import {
  useDeleteNewsletterSubscriber,
  useNewsletterPicks,
  useNewsletterSubscribers,
  useSendNewsletter,
} from "@/hooks/useAdminNewsletter";
import { validationMessage } from "@/lib/api";
import { formatDateSq } from "@/lib/format";
import {
  btnPrimary,
  fieldError,
  fieldLabel,
  inputClass,
  pageTitle,
  panelLead,
} from "@/lib/ui";

const rowButton =
  "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink hover:border-accent/60";

type Kind = "offer" | "bundle" | "business";

const kinds: { kind: Kind; label: string; singular: string }[] = [
  { kind: "offer", label: "Ofertat", singular: "ofertë" },
  { kind: "bundle", label: "Fletushkat", singular: "fletushkë" },
  { kind: "business", label: "Dyqanet", singular: "dyqan" },
];

function PickSearch({
  kind,
  label,
  selected,
  onAdd,
}: {
  kind: Kind;
  label: string;
  selected: NewsletterPick[];
  onAdd: (item: NewsletterPick) => void;
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const picks = useNewsletterPicks(kind, debounced, open);
  const full = selected.length >= 12;
  const results = (picks.data ?? []).filter(
    (item) => !selected.some((picked) => picked.id === item.id),
  );
  const showMenu = open && !full && (picks.isFetching || results.length > 0 || debounced !== "");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative">
      <input
        className={inputClass}
        value={query}
        placeholder={`Kërko te ${label.toLowerCase()}`}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
      />
      {full ? (
        <p className="m-0 mt-2 text-xs font-semibold text-muted">Deri në 12 për këtë lloj.</p>
      ) : null}
      {showMenu ? (
        <ul className="absolute top-[calc(100%+6px)] right-0 left-0 z-30 m-0 max-h-56 list-none overflow-auto rounded-xl border border-line bg-elevated p-1 shadow-[0_10px_28px_var(--color-shadow)]">
          {picks.isFetching && results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">Duke kërkuar…</li>
          ) : null}
          {!picks.isFetching && results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">Asgjë nuk u gjet.</li>
          ) : null}
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="grid w-full cursor-pointer rounded-lg border-0 bg-transparent px-3 py-2 text-left hover:bg-sunken"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (selected.length >= 12) {
                    return;
                  }
                  onAdd(item);
                  setQuery("");
                }}
              >
                <span className="truncate text-sm font-semibold">{item.title}</span>
                {item.detail !== "" ? (
                  <span className="truncate text-xs text-muted">{item.detail}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function AdminNewsletter() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const subscribersQuery = useNewsletterSubscribers(page, q);
  const removeSubscriber = useDeleteNewsletterSubscriber();
  const sendNewsletter = useSendNewsletter();

  const [subject, setSubject] = useState("");
  const [intro, setIntro] = useState("");
  const [offers, setOffers] = useState<NewsletterPick[]>([]);
  const [bundles, setBundles] = useState<NewsletterPick[]>([]);
  const [shops, setShops] = useState<NewsletterPick[]>([]);
  const [tab, setTab] = useState<Kind>("offer");
  const [formError, setFormError] = useState<string | null>(null);
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [confirmSend, setConfirmSend] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<NewsletterSubscriber | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = query.trim();
      setQ((current) => {
        if (current !== next) {
          setPage(1);
        }
        return next;
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const subscribers = subscribersQuery.data?.data ?? [];
  const total = subscribersQuery.data?.meta?.total ?? 0;
  const lastPage = subscribersQuery.data?.meta?.last_page ?? 1;
  const activeCount = subscribersQuery.data?.active_count ?? 0;
  const groups = [
    { kind: "offer" as const, label: "Ofertë", items: offers, clear: setOffers },
    { kind: "bundle" as const, label: "Fletushkë", items: bundles, clear: setBundles },
    { kind: "business" as const, label: "Dyqan", items: shops, clear: setShops },
  ];
  const picked = groups.flatMap((group) =>
    group.items.map((item) => ({ ...item, kind: group.kind, kindLabel: group.label })),
  );
  const activeKind = kinds.find((item) => item.kind === tab) ?? kinds[0];
  const activeSelected =
    tab === "offer" ? offers : tab === "bundle" ? bundles : shops;
  const setActive =
    tab === "offer" ? setOffers : tab === "bundle" ? setBundles : setShops;
  const summary = [
    offers.length > 0 ? `${offers.length} ${offers.length === 1 ? "ofertë" : "oferta"}` : null,
    bundles.length > 0
      ? `${bundles.length} ${bundles.length === 1 ? "fletushkë" : "fletushka"}`
      : null,
    shops.length > 0 ? `${shops.length} ${shops.length === 1 ? "dyqan" : "dyqane"}` : null,
  ]
    .filter((part): part is string => part !== null)
    .join(" · ");

  const onSend = (event: FormEvent) => {
    event.preventDefault();
    if (subject.trim() === "") {
      setFormError("Subjekti është i detyrueshëm.");
      return;
    }
    if (offers.length + bundles.length + shops.length === 0) {
      setFormError("Zgjidh të paktën një ofertë, fletushkë ose dyqan.");
      return;
    }
    if (activeCount === 0) {
      setFormError("Nuk ka abonentë ende.");
      return;
    }
    setFormError(null);
    setConfirmSend(true);
  };

  const confirm = () => {
    sendNewsletter.mutate(
      {
        subject: subject.trim(),
        intro: intro.trim(),
        offer_ids: offers.map((item) => item.id),
        bundle_ids: bundles.map((item) => item.id),
        business_ids: shops.map((item) => item.id),
      },
      {
        onSuccess: (payload) => {
          setConfirmSend(false);
          setSentCount(payload.data.recipient_count);
          setSubject("");
          setIntro("");
          setOffers([]);
          setBundles([]);
          setShops([]);
        },
        onError: (error) => {
          setConfirmSend(false);
          setFormError(validationMessage(error, "Nuk mundëm ta dërgojmë email-in."));
        },
      },
    );
  };

  return (
    <div>
      <h1 className={pageTitle}>Newsletter</h1>
      <p className={`${panelLead} mb-6 max-w-xl`}>
        Zgjidh ofertat, fletushkat dhe dyqanet. Çdo adresë merr email-in e vet.
      </p>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <form
          className="grid gap-6 rounded-2xl border border-line bg-elevated p-5 sm:p-6"
          onSubmit={onSend}
          noValidate
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="m-0 text-lg font-extrabold tracking-[-0.03em]">Dërgo email</h2>
            <p className="m-0 text-sm text-muted">
              {activeCount} {activeCount === 1 ? "adresë" : "adresa"}
            </p>
          </div>
          {sentCount !== null ? (
            <p className="m-0 rounded-xl border border-accent/40 bg-accent/10 px-3.5 py-2.5 text-sm font-semibold text-ink">
              U radhit për {sentCount} adresa.
            </p>
          ) : null}
          {formError ? (
            <p className={fieldError} role="alert">
              {formError}
            </p>
          ) : null}
          <div className="grid gap-4">
            <label className={fieldLabel}>
              <span>Subjekti</span>
              <input
                className={inputClass}
                value={subject}
                maxLength={150}
                placeholder="Oferta të reja këtë javë"
                onChange={(event) => setSubject(event.target.value)}
              />
            </label>
            <label className={fieldLabel}>
              <span>Hyrja, nëse do</span>
              <textarea
                className={`${inputClass} min-h-24 resize-y`}
                value={intro}
                maxLength={2000}
                placeholder="Një fjali në fillim të email-it."
                onChange={(event) => setIntro(event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-3 border-t border-line pt-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="m-0 text-sm font-semibold text-ink">Çfarë shkon në email</p>
              <p className="m-0 text-xs text-muted">Deri në 12 për lloj</p>
            </div>
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Lloji i përmbajtjes">
              {kinds.map((item) => {
                const count =
                  item.kind === "offer"
                    ? offers.length
                    : item.kind === "bundle"
                      ? bundles.length
                      : shops.length;
                const selected = tab === item.kind;
                return (
                  <button
                    key={item.kind}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm font-semibold ${
                      selected
                        ? "border-accent bg-accent/15 text-ink"
                        : "border-line bg-transparent text-muted hover:text-ink"
                    }`}
                    onClick={() => setTab(item.kind)}
                  >
                    {item.label}
                    <span className={count > 0 ? "text-xs text-ink" : "text-xs text-muted"}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <PickSearch
              key={tab}
              kind={activeKind.kind}
              label={activeKind.label}
              selected={activeSelected}
              onAdd={(item) => setActive([...activeSelected, item])}
            />
            {picked.length > 0 ? (
              <div className="grid gap-4">
                {groups.map((group) =>
                  group.items.length === 0 ? null : (
                    <div key={group.kind}>
                      <p className="m-0 mb-2 text-[0.65rem] font-bold tracking-[0.14em] text-muted uppercase">
                        {kinds.find((item) => item.kind === group.kind)?.label}
                      </p>
                      <ul className="m-0 grid list-none gap-2 p-0">
                        {group.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-sunken px-3 py-2.5"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold">{item.title}</span>
                              {item.detail !== "" ? (
                                <span className="block truncate text-xs text-muted">{item.detail}</span>
                              ) : null}
                            </span>
                            <button
                              type="button"
                              className="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-muted hover:text-ink"
                              onClick={() =>
                                group.clear(group.items.filter((pickedItem) => pickedItem.id !== item.id))
                              }
                            >
                              Hiq
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p className="m-0 rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm text-muted">
                Asgjë e zgjedhur ende. Kërko dhe shto çfarë do të jetë në email.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="m-0 text-sm text-muted">
              {summary !== "" ? summary : "Asgjë e zgjedhur ende"}
              {" · "}
              {activeCount} {activeCount === 1 ? "adresë" : "adresa"}
            </p>
            <button className={btnPrimary} type="submit" disabled={sendNewsletter.isPending}>
              Dërgo email
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-2xl border border-line bg-elevated xl:sticky xl:top-4">
          <div className="flex items-end justify-between gap-3 px-4 pt-4 pb-3">
            <div>
              <h2 className="m-0 text-[0.65rem] font-bold tracking-[0.14em] text-muted uppercase">
                Abonentët
              </h2>
              <p className="m-0 mt-1 text-3xl font-extrabold tracking-[-0.04em]">{activeCount}</p>
            </div>
            <p className="m-0 pb-1 text-sm text-muted">aktivë</p>
          </div>
          <TableSearch value={query} onChange={setQuery} label="Kërko email-in" />
          {subscribersQuery.isLoading ? (
            <div className="p-5">
              <Spinner label="Duke ngarkuar abonentët" />
            </div>
          ) : subscribersQuery.isError ? (
            <p className={`${panelLead} px-5`}>
              {validationMessage(
                subscribersQuery.error,
                "Nuk mundëm t’i ngarkojmë abonentët.",
              )}
            </p>
          ) : subscribers.length === 0 ? (
            <p className={`${panelLead} px-5`}>
              {q === "" ? "Nuk ka abonentë ende." : "Nuk u gjet asnjë adresë."}
            </p>
          ) : (
            <>
              <ul className="m-0 list-none p-0">
                {subscribers.map((subscriber) => (
                  <li
                    key={subscriber.id}
                    className="flex items-center justify-between gap-4 border-t border-line px-4 py-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{subscriber.email}</span>
                      {subscriber.created_at ? (
                        <span className="block text-sm text-muted">
                          {formatDateSq(subscriber.created_at)}
                        </span>
                      ) : null}
                    </span>
                    <button
                      type="button"
                      className={rowButton}
                      aria-label={`Hiq ${subscriber.email}`}
                      onClick={() => setPendingDelete(subscriber)}
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </button>
                  </li>
                ))}
              </ul>
              <Pagination
                page={page}
                lastPage={lastPage}
                total={total}
                perPage={NEWSLETTER_PAGE_SIZE}
                onPageChange={setPage}
              />
            </>
          )}
        </section>
      </div>

      <ConfirmModal
        open={confirmSend}
        title="Dërgo email-in?"
        message={`Ky email shkon te ${activeCount} ${activeCount === 1 ? "adresë" : "adresa"}${summary !== "" ? `, me ${summary}` : ""}. Çdo email ka edhe një link për t’u çregjistruar.`}
        confirmLabel="Dërgo"
        pending={sendNewsletter.isPending}
        onConfirm={confirm}
        onClose={() => setConfirmSend(false)}
      />
      <ConfirmModal
        open={pendingDelete !== null}
        danger
        title="Hiq adresën?"
        message={
          pendingDelete
            ? `${pendingDelete.email} del nga lista dhe nuk merr më email.`
            : ""
        }
        confirmLabel="Hiq"
        pending={removeSubscriber.isPending}
        onConfirm={() => {
          if (!pendingDelete) {
            return;
          }
          removeSubscriber.mutate(pendingDelete.id, {
            onSuccess: () => setPendingDelete(null),
          });
        }}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
