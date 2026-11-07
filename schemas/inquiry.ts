import { z } from "zod";

const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

const emailField = z
  .string()
  .trim()
  .min(1, "Shkruaj email-in.")
  .max(255, "Email-i është shumë i gjatë.")
  .regex(emailPattern, "Shkruaj një email të vlefshëm.");

function requiredText(emptyMessage: string, max: number, tooLong: string) {
  return z.string().trim().min(1, emptyMessage).max(max, tooLong);
}

function optionalText(max: number, tooLong: string) {
  return z
    .string()
    .trim()
    .max(max, tooLong)
    .transform((value) => (value === "" ? null : value));
}

export const contactFormSchema = z.object({
  name: requiredText("Shkruaj emrin.", 120, "Emri është shumë i gjatë."),
  email: emailField,
  phone: optionalText(40, "Telefoni është shumë i gjatë."),
  message: requiredText("Shkruaj mesazhin.", 5000, "Mesazhi është shumë i gjatë."),
});

export const partnerFormSchema = z.object({
  name: requiredText("Shkruaj emrin.", 120, "Emri është shumë i gjatë."),
  email: emailField,
  businessName: requiredText(
    "Shkruaj emrin e dyqanit.",
    160,
    "Emri i dyqanit është shumë i gjatë.",
  ),
  city: requiredText("Shkruaj qytetin.", 120, "Qyteti është shumë i gjatë."),
  phone: optionalText(40, "Telefoni është shumë i gjatë."),
  message: optionalText(5000, "Mesazhi është shumë i gjatë."),
});

export type ContactFormInput = z.input<typeof contactFormSchema>;
export type ContactFormValues = z.output<typeof contactFormSchema>;
export type PartnerFormInput = z.input<typeof partnerFormSchema>;
export type PartnerFormValues = z.output<typeof partnerFormSchema>;

export function fieldMessages<Key extends string>(
  issues: { path: PropertyKey[]; message: string }[],
  order: readonly Key[],
): Partial<Record<Key, string>> {
  const messages: Partial<Record<Key, string>> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key !== "string" || !order.includes(key as Key) || messages[key as Key]) {
      continue;
    }
    messages[key as Key] = issue.message;
  }
  return messages;
}
