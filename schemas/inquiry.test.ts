import { describe, expect, it } from "vitest";
import { contactFormSchema, fieldMessages, partnerFormSchema } from "@/schemas/inquiry";

const contactFields = ["name", "email", "phone", "message"] as const;
const partnerFields = ["name", "email", "businessName", "city", "phone", "message"] as const;

describe("contact form validation", () => {
  it("reports every empty required field at once", () => {
    const result = contactFormSchema.safeParse({
      name: "  ",
      email: "",
      phone: "",
      message: " ",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(fieldMessages(result.error.issues, contactFields)).toEqual({
      name: "Shkruaj emrin.",
      email: "Shkruaj email-in.",
      message: "Shkruaj mesazhin.",
    });
  });

  it("asks for a real email without replacing the empty-email message", () => {
    const invalid = contactFormSchema.safeParse({
      name: "Ana",
      email: "ana@shembull",
      phone: "",
      message: "Përshëndetje",
    });
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(fieldMessages(invalid.error.issues, contactFields).email).toBe(
        "Shkruaj një email të vlefshëm.",
      );
    }

    const valid = contactFormSchema.safeParse({
      name: "  Ana  ",
      email: " ana@shembull.com ",
      phone: "  ",
      message: "  Përshëndetje  ",
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data).toEqual({
        name: "Ana",
        email: "ana@shembull.com",
        phone: null,
        message: "Përshëndetje",
      });
    }
  });
});

describe("partner form validation", () => {
  it("reports every empty required field at once", () => {
    const result = partnerFormSchema.safeParse({
      name: "",
      email: "",
      businessName: " ",
      city: "",
      phone: "",
      message: "",
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(fieldMessages(result.error.issues, partnerFields)).toEqual({
      name: "Shkruaj emrin.",
      email: "Shkruaj email-in.",
      businessName: "Shkruaj emrin e dyqanit.",
      city: "Shkruaj qytetin.",
    });
  });

  it("keeps an optional message empty and trims the shop fields", () => {
    const result = partnerFormSchema.safeParse({
      name: " Ana ",
      email: "ana@dyqani.com",
      businessName: " Kafe ",
      city: " Prishtinë ",
      phone: "",
      message: "  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: "Ana",
        email: "ana@dyqani.com",
        businessName: "Kafe",
        city: "Prishtinë",
        phone: null,
        message: null,
      });
    }
  });
});
