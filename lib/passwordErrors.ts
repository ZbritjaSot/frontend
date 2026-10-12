import { ApiError, validationMessage } from "@/lib/api";

/** Map API / validation password errors to Albanian UI copy. */
export function passwordError(
  error: unknown,
  fallback = "Nuk mundëm ta ndryshojmë fjalëkalimin.",
): string {
  const fromBody = validationMessage(error, "");
  const message =
    fromBody ||
    (error instanceof ApiError ? error.message : "") ||
    (error instanceof Error ? error.message : "") ||
    fallback;

  if (message === "The current password is incorrect.") {
    return "Fjalëkalimi aktual nuk është i saktë.";
  }

  if (message === "The new password must be different.") {
    return "Fjalëkalimi i ri duhet të jetë i ndryshëm.";
  }

  return message || fallback;
}

export function validateNewPassword(
  password: string,
  confirmation: string,
): string | null {
  if (password.length < 8) {
    return "Fjalëkalimi i ri duhet të ketë të paktën 8 karaktere.";
  }
  if (password !== confirmation) {
    return "Fjalëkalimet nuk përputhen.";
  }
  return null;
}
