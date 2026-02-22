export const fetchSchools = async (supabaseClient) => {
  const { data, error } = await supabaseClient
    .from("schools")
    .select("id, name, short_name")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map((school) => ({
    id: school.id,
    name: school.name,
    short_name: school.short_name,
  }));
};

export const checkExistingProfileByEmail = async (supabaseClient, email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return Boolean(data);
};

export const initiateSignup = async (supabaseClient, email, password, redirectUrl) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  const { data, error } = await supabaseClient.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    throw error;
  }

  return { data, normalizedEmail };
};

export const verifySignupOtp = async (supabaseClient, email, otp) => {
  const { data, error } = await supabaseClient.auth.verifyOtp({
    email,
    token: String(otp || "").trim(),
    type: "signup",
  });

  if (error) {
    throw error;
  }

  return data;
};

export const buildProfilePayload = (formData, selectedSchool, userId) => ({
  id: userId,
  full_name: formData.fullName,
  email: String(formData.email || "").trim().toLowerCase(),
  role: formData.role,
  school_id: selectedSchool?.id || null,
  faculty: formData.faculty || null,
  department: formData.department || null,
  level: formData.role === "student" ? parseInt(formData.level, 10) || null : null,
  matric_no: formData.role === "student" ? formData.matricNo || null : null,
  staff_id: formData.role === "lecturer" ? formData.staffId || null : null,
  is_onboarded: true,
});

export const upsertProfile = async (supabaseClient, profileData) => {
  const { data, error } = await supabaseClient
    .from("profiles")
    .upsert([profileData], { onConflict: "id" })
    .select();

  if (error) {
    throw error;
  }

  return data;
};
