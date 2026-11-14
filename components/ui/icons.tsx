import type { ReactNode } from "react";
import { NavIcon, type IconName } from "@/components/chrome/NavIcon";

type IconProps = {
  /** MUI-style sizes: small 20px, default 24px, inherit follows the font size. */
  fontSize?: "small" | "medium" | "inherit";
  sx?: { fontSize?: number };
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
};

function make(name: IconName) {
  return function Icon({ fontSize = "medium", sx, className }: IconProps): ReactNode {
    const size = sx?.fontSize ?? (fontSize === "small" ? 20 : fontSize === "inherit" ? "1em" : 24);
    return <NavIcon name={name} size={size} className={className} />;
  };
}

export const ArrowBackIcon = make("arrow-back");
export const DeleteOutlinedIcon = make("trash");
export const AddOutlinedIcon = make("plus");
export const EditOutlinedIcon = make("edit");
export const VisibilityOutlinedIcon = make("eye");
export const LockOutlinedIcon = make("lock");
export const CheckOutlinedIcon = make("check");
export const SearchIcon = make("search");
export const LockOpenOutlinedIcon = make("lock-open");
export const ChevronRightIcon = make("chevron-right");
export const SendOutlinedIcon = make("send");
export const HomeOutlinedIcon = make("home");
export const HistoryOutlinedIcon = make("history");
export const ExpandMoreIcon = make("chevron-down");
export const DragIndicatorIcon = make("drag");
export const CloseIcon = make("close");
export const ChevronLeftIcon = make("chevron-left");
export const AddPhotoAlternateOutlinedIcon = make("photo-add");
export const StoreIcon = make("shops");
export const StarBorderOutlinedIcon = make("star");
export const PhotoCameraOutlinedIcon = make("camera");
export const PersonOutlinedIcon = make("user");
export const PendingActionsIcon = make("clock");
export const MailOutlinedIcon = make("mail");
export const LightModeIcon = make("sun");
export const KeyboardArrowDownIcon = make("chevron-down");
export const DashboardIcon = make("dashboard");
export const DarkModeIcon = make("moon");
export const WarningAmberOutlinedIcon = make("warning");
export const StorefrontOutlinedIcon = make("shops");
export const PaymentsIcon = make("payments");
export const OpenInNewOutlinedIcon = make("external");
export const MenuBookOutlinedIcon = make("book");
export const MenuIcon = make("menu");
export const LogoutIcon = make("logout");
export const LoginOutlinedIcon = make("login");
export const LocalOfferOutlinedIcon = make("deals");
export const LocalOfferIcon = make("deals");
export const ImageOutlinedIcon = make("image");
export const ErrorOutlineOutlinedIcon = make("alert-circle");
export const DescriptionOutlinedIcon = make("document");
export const CollectionsOutlinedIcon = make("collections");
export const CheckCircleOutlinedIcon = make("check-circle");
export const CategoryIcon = make("dashboard");
export const AccountTreeOutlinedIcon = make("sitemap");
