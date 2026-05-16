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

  let userId: string;
  let userRole: string;

  try {
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

    userId = user.id as string;
    userRole = user.role as string;
  } catch {
    return { message: "Login failed. Please try again." };
  }

  await createSession(userId, userRole);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
