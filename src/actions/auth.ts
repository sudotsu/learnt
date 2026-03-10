"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData): Promise<void> {
  const passcode = formData.get("passcode") as string;
  if (passcode === process.env.APP_PASSCODE) {
    const jar = await cookies();
    jar.set("fn_auth", passcode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    redirect("/");
  }
  redirect("/login?error=1");
}
