"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { DashboardKpi } from "@/components/ui/DashboardKpi";
import { adminBusinessKey, IndicatorKey } from "@/components/ui/IndicatorKey";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { TableSearch } from "@/components/ui/TableSearch";
import { ShopLogo } from "@/features/public/visuals";
import { ADMIN_BUSINESSES_PAGE_SIZE } from "@/features/admin/businessesApi";
import {
  useAdminBusinesses,
  useApproveBranch,
  useCreateBusiness,
  useUpdateBusiness,
} from "@/hooks/useAdminBusinesses";
import { accountEmailMessage, validationMessage } from "@/lib/api";
import {
  btnGhost,
  btnPrimary,
  checkInput,
  fieldError,
  fieldLabel,
  inputClass,
  offerStatusClass,
  pageTitle,
  panelLead,
} from "@/lib/ui";
import { businessFormSchema, type BusinessFormInput } from "@/schemas/business";
import type { Business } from "@/types";

const emptyForm: BusinessFormInput = {
  name: "",
  owner_name: "",
  owner_email: "",
  is_active: true,
};

const rowButton =
  "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink hover:border-accent/60 disabled:cursor-wait disabled:opacity-65";

const checkLabelClass =
  "flex cursor-pointer flex-row items-start gap-3 font-medium text-ink select-none";

const checkTextClass = "min-w-0 flex-1 pt-px leading-[1.4]";

function ShopLine({
  business,
  branch = false,
  open = false,
  branchCount = 0,
  onToggle,
  pending,
  onActive,
  onPriority,
  onApprove,
  className = "",
}: {
  business: Business;
  branch?: boolean;
  open?: boolean;
  branchCount?: number;
  onToggle?: () => void;
  pending: boolean;
  onActive: () => void;
  onPriority: () => void;
  onApprove?: () => void;
  className?: string;
}) {
  const place = [
    business.street,
    business.neighborhood,
    business.village,
    business.municipality,
    business.city,
  ]
    .filter(Boolean)
    .join(", ");
  const needsBranchApproval = branch && business.is_approved === false;

  return (
    <li
      className={`col-span-4 grid items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-subgrid md:gap-x-4${className ? ` ${className}` : ""}`}
    >
      <div className="min-w-0">
        <p className="m-0 flex min-w-0 items-center gap-3 text-base font-semibold">
          <ShopLogo name={business.name} logoUrl={business.logo_url} size="sm" />
          <span className="min-w-0">
            <span className="block truncate">{business.name}</span>
            {place ? (
              <span className="block truncate text-sm font-medium text-muted">{place}</span>
            ) : null}
          </span>
          {branch ? (
            <span className="shrink-0 text-xs font-bold tracking-[0.08em] text-muted uppercase">
              Degë
            </span>
          ) : branchCount > 0 ? (
            <span className="shrink-0 text-xs font-bold tracking-[0.08em] text-muted uppercase">
              {branchCount} degë
            </span>
          ) : null}
        </p>
        {business.location_status === "pending" ? (
          <span className={`${offerStatusClass("pending")} mt-2`}>
            Adresë në pritje
          </span>
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="m-0 truncate text-base font-semibold">
          {business.owner?.name ?? "Pa pronar"}
        </p>
        {business.owner?.email ? (
          <p className="m-0 truncate text-sm text-muted">{business.owner.email}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 md:ml-6">
        {business.is_approved === false ? (
          <span className={`${offerStatusClass("pending")} mt-0! w-fit self-center!`}>
            Pret aprovim
          </span>
        ) : (
          <span
            className={`${offerStatusClass(business.is_active ? "approved" : "rejected")} mt-0! w-fit self-center!`}
          >
            {business.is_active ? "Aktive" : "Joaktive"}
          </span>
        )}
        {business.is_approved !== false && business.on_trial ? (
          <span className={`${offerStatusClass("pending")} mt-0! w-fit self-center!`}>
            Provë falas
          </span>
        ) : null}
        {business.is_approved !== false && business.ending_soon ? (
          <span className={`${offerStatusClass("expired")} mt-0! w-fit self-center!`}>
            Skadon së shpejti
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-4 gap-1.5 border-l border-line pl-4">
        {branchCount > 0 ? (
          <button
            type="button"
            className={`${rowButton}${open ? " border-accent/60" : ""}`}
            aria-expanded={open}
            aria-label={open ? `Mbyll degët e ${business.name}` : `Hap degët e ${business.name}`}
            onClick={onToggle}
          >
            <ExpandMoreIcon
              fontSize="small"
              className={open ? "rotate-180 text-accent!" : ""}
            />
          </button>
        ) : needsBranchApproval && onApprove ? (
          <button
            type="button"
            className={rowButton}
            aria-label={`Aprovo degën ${business.name}`}
            disabled={pending}
            onClick={onApprove}
          >
            <CheckOutlinedIcon fontSize="small" className="text-accent!" />
          </button>
        ) : (
          <span className="size-9" aria-hidden />
        )}
        <Link
          className={`${rowButton} no-underline`}
          href={`/admin/businesses/${business.id}`}
          aria-label={`Ndrysho ${business.name}`}
        >
          <EditOutlinedIcon fontSize="small" />
        </Link>
        <button
          className={rowButton}
          type="button"
          aria-label={
            business.is_active ? `Çaktivizo ${business.name}` : `Aktivizo ${business.name}`
          }
          disabled={pending}
          onClick={onActive}
        >
          {business.is_active ? (
            <LockOutlinedIcon fontSize="small" />
          ) : (
            <LockOpenOutlinedIcon fontSize="small" className="text-accent!" />
          )}
        </button>
        <button
          className={rowButton}
          type="button"
          title={business.is_priority ? "Hiq prioritetin" : "Jepi prioritet"}
          aria-label={
            business.is_priority
              ? `Hiq prioritetin e ${business.name}`
              : `Jepi prioritet ${business.name}`
          }
          aria-pressed={business.is_priority === true}
          disabled={pending}
          onClick={onPriority}
        >
          <StarBorderOutlinedIcon
            fontSize="small"
            className={business.is_priority ? "text-accent!" : undefined}
          />
        </button>
      </div>
    </li>
  );
}

export function AdminBusinesses({ initialScope = "" }: { initialScope?: string }) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const [scope, setScope] = useState(initialScope);
  const { data, isLoading, isError, error, refetch } = useAdminBusinesses(page, q, scope);
  const createMutation = useCreateBusiness();
  const updateMutation = useUpdateBusiness();
  const approveBranch = useApproveBranch();

  const [openIds, setOpenIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<BusinessFormInput>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [createdAccount, setCreatedAccount] = useState<{
    name: string;
    email: string;
  } | null>(null);

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

  function openCreate() {
    setForm(emptyForm);
    setFormError(null);
    setCreating(true);
  }

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    const parsed = businessFormSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Kontrollo fushat.");
      return;
    }
    setFormError(null);
    try {
      await createMutation.mutateAsync(parsed.data);
      setCreating(false);
      setPage(1);
      setCreatedAccount({
        name: parsed.data.name,
        email: parsed.data.owner_email,
      });
    } catch (submitError) {
      setFormError(
        accountEmailMessage(submitError, "Nuk mundëm ta krijojmë biznesin."),
      );
    }
  }

  const businesses = data?.data ?? [];
  const lastPage = data?.meta?.last_page;
  const total = data?.meta?.total ?? businesses.length;
  if (lastPage !== undefined && page > lastPage) {
    setPage(lastPage);
  }

  const header = (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className={`${pageTitle} mb-0!`}>Bizneset</h1>
        <button className={btnPrimary} type="button" onClick={openCreate}>
          <AddOutlinedIcon fontSize="small" />
          Shto biznes
        </button>
      </div>
      <IndicatorKey items={adminBusinessKey} />
    </>
  );

  if (isLoading) {
    return (
      <div>
        {header}
        <Spinner label="Duke ngarkuar bizneset" />
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        {header}
        <div className="max-w-[40rem]">
          <p className={panelLead}>
            {validationMessage(error, "Nuk mundëm t’i ngarkojmë bizneset.")}
          </p>
          <button className={btnGhost} type="button" onClick={() => refetch()}>
            Provo përsëri
          </button>
        </div>
      </div>
    );
  }

  const counts = data?.counts;

  function onPriority(business: Business) {
    setRowError(null);
    updateMutation.mutate(
      { id: business.id, is_priority: business.is_priority !== true },
      {
        onError: (error) => {
          setRowError(
            validationMessage(error, "Nuk mundëm ta ndryshojmë prioritetin."),
          );
        },
      },
    );
  }

  function chooseScope(next: string) {
    setScope((current) => (current === next ? "" : next));
    setPage(1);
  }

  return (
    <div>
      {header}
      {counts ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <DashboardKpi
            value={counts.active}
            label="Aktive"
            detail="Dyqane që mund të dalin publik"
            tone="accent"
            active={scope === "active"}
            onClick={() => chooseScope("active")}
          />
          <DashboardKpi
            value={counts.inactive}
            label="Joaktive"
            detail="Të fshehura nga faqja"
            active={scope === "inactive"}
            onClick={() => chooseScope("inactive")}
          />
          <DashboardKpi
            value={counts.ending_soon ?? 0}
            label="Skadon së shpejti"
            detail="Duhet zgjatje ose pagesë"
            tone={(counts.ending_soon ?? 0) > 0 ? "danger" : "ink"}
            active={scope === "ending_soon"}
            onClick={() => chooseScope("ending_soon")}
          />
          <DashboardKpi
            value={counts.address}
            label="Adresa në pritje"
            detail="Presin aprovim"
            tone={counts.address > 0 ? "pending" : "ink"}
            active={scope === "address"}
            onClick={() => chooseScope("address")}
          />
          <DashboardKpi
            value={counts.branches ?? 0}
            label="Degë në pritje"
            detail="Lokacione të reja"
            tone={(counts.branches ?? 0) > 0 ? "pending" : "ink"}
            active={scope === "branches"}
            onClick={() => chooseScope("branches")}
          />
        </div>
      ) : null}

      {rowError ? (
        <p className={`${fieldError} mb-3`} role="alert">
          {rowError}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-line">
        <TableSearch
          value={query}
          onChange={setQuery}
          label="Kërko biznesin"
        />
        {businesses.length === 0 ? (
          <p className="m-0 px-4 py-6 text-sm leading-relaxed text-muted">
            {q === "" ? "Nuk ka biznese ende." : "Nuk u gjet asnjë biznes."}
          </p>
        ) : (
          <div className="overflow-x-auto md:grid md:grid-cols-[minmax(11rem,1.3fr)_minmax(9rem,1.1fr)_minmax(9rem,13rem)_auto] md:gap-x-4">
            <div className="col-span-4 hidden items-center border-b border-line bg-sunken px-4 py-3 text-xs font-bold tracking-[0.08em] text-muted uppercase md:grid md:grid-cols-subgrid">
              <span className="whitespace-nowrap">Biznesi</span>
              <span className="whitespace-nowrap">Pronari</span>
              <span className="whitespace-nowrap md:pl-6">Statusi</span>
              <span className="border-l border-line pl-4 whitespace-nowrap">
                Veprimet
              </span>
            </div>
            <ul className="col-span-4 m-0 list-none p-0 md:grid md:grid-cols-subgrid">
              {businesses.flatMap((business) => {
                const allBranches = business.branches ?? [];
                const branches =
                  scope === "branches"
                    ? allBranches.filter((branch) => branch.is_approved === false)
                    : allBranches;
                const open =
                  q !== "" ||
                  scope === "address" ||
                  scope === "branches" ||
                  openIds.includes(business.id);
                const rows = [
                  <ShopLine
                    key={business.id}
                    business={business}
                    open={open}
                    branchCount={allBranches.length}
                    pending={updateMutation.isPending || approveBranch.isPending}
                    onToggle={() =>
                      setOpenIds((current) =>
                        current.includes(business.id)
                          ? current.filter((id) => id !== business.id)
                          : [...current, business.id],
                      )
                    }
                    onActive={() =>
                      updateMutation.mutate({
                        id: business.id,
                        is_active: !business.is_active,
                      })
                    }
                    onPriority={() => onPriority(business)}
                  />,
                ];
                if (open) {
                  for (const branch of branches) {
                    rows.push(
                      <ShopLine
                        key={branch.id}
                        business={branch}
                        branch
                        className="bg-sunken/50"
                        pending={updateMutation.isPending || approveBranch.isPending}
                        onApprove={
                          branch.is_approved === false
                            ? () => approveBranch.mutate(branch.id)
                            : undefined
                        }
                        onActive={() =>
                          updateMutation.mutate({
                            id: branch.id,
                            is_active: !branch.is_active,
                          })
                        }
                        onPriority={() => onPriority(branch)}
                      />,
                    );
                  }
                }
                return rows;
              })}
            </ul>
          </div>
        )}
        {businesses.length > 0 ? (
          <Pagination
            page={page}
            lastPage={lastPage ?? 1}
            total={total}
            perPage={ADMIN_BUSINESSES_PAGE_SIZE}
            onPageChange={setPage}
          />
        ) : null}
      </div>

      <Modal
        open={createdAccount !== null}
        title="Llogaria u krijua"
        onClose={() => setCreatedAccount(null)}
        footer={
          <button
            className={btnPrimary}
            type="button"
            onClick={() => setCreatedAccount(null)}
          >
            Në rregull
          </button>
        }
      >
        <p className="m-0 text-sm leading-relaxed text-muted">
          <span className="font-semibold text-ink">{createdAccount?.name}</span>{" "}
          është gati. Fjalëkalimi i përkohshëm u dërgua te{" "}
          <span className="font-semibold text-ink">{createdAccount?.email}</span>
          . Në hyrjen e parë pronari duhet ta ndryshojë.
        </p>
      </Modal>

      <Modal
        open={creating}
        title="Biznes i ri"
        onClose={() => {
          if (!createMutation.isPending) {
            setCreating(false);
          }
        }}
        size="md"
        footer={
          <>
            <button
              className={btnGhost}
              type="button"
              disabled={createMutation.isPending}
              onClick={() => setCreating(false)}
            >
              Anulo
            </button>
            <button
              className={btnPrimary}
              type="submit"
              form="admin-business-create"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Duke u ruajtur…" : "Krijo llogarinë"}
            </button>
          </>
        }
      >
        <form
          id="admin-business-create"
          className="flex max-w-[40rem] flex-col gap-5"
          onSubmit={onCreate}
          noValidate
        >
          <p className="text-[0.8125rem] text-muted">
            Një fjalëkalim i rastësishëm i dërgohet pronarit me email. Në
            hyrjen e parë duhet ta ndryshojë.
          </p>
          {formError ? (
            <p className={fieldError} role="alert">
              {formError}
            </p>
          ) : null}
          <label className={fieldLabel}>
            <span>Emri i biznesit</span>
            <input
              className={inputClass}
              value={form.name}
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </label>
          <label className={fieldLabel}>
            <span>Emri i pronarit (opsional)</span>
            <input
              className={inputClass}
              value={form.owner_name}
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  owner_name: event.target.value,
                }))
              }
            />
          </label>
          <label className={fieldLabel}>
            <span>Email</span>
            <input
              className={inputClass}
              type="email"
              value={form.owner_email}
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  owner_email: event.target.value,
                }))
              }
            />
          </label>
          <label className={checkLabelClass}>
            <input
              className={checkInput}
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  is_active: event.target.checked,
                }))
              }
            />
            <span className={checkTextClass}>Llogaria aktive</span>
          </label>
        </form>
      </Modal>
    </div>
  );
}
