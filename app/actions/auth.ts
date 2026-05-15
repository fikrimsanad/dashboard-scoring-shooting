"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { LoginFormSchema, type LoginFormState } from "@/lib/definitions";
import { createSession, deleteSession } from "@/lib/session";
import { createServerClient } from "@/lib/supabase/server";

export async function login(
  state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const validatedFields = LoginFormSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { username, password } = validatedFields.data;

  const supabase = createServerClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, password_hash, role")
    .eq("username", username)
    .single();

  if (error || !user) {
    return { message: "Invalid username or password." };
  }

  const passwordMatch = await compare(password, user.password_hash as string);
  if (!passwordMatch) {
    return { message: "Invalid username or password." };
  }

  await createSession(user.id as string, user.role as string);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
