export const handleLoginError = (error) => {
  const code = error?.code;

  switch (code) {
    case "auth/user-not-found":
      return "No account found with this email";
    case "auth/wrong-password":
      return "Incorrect password";
    case "auth/invalid-email":
      return "Invalid email address";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later";
    default:
      return error?.message || "Login failed";
  }
};

export const handleRegisterError = (error) => {
  const code = error?.code;

  switch (code) {
    case "auth/email-already-in-use":
      return "Email already registered";
    case "auth/weak-password":
      return "Password must be at least 6 characters";
    case "auth/invalid-email":
      return "Invalid email address";
    default:
      return error?.message || "Registration failed";
  }
};
