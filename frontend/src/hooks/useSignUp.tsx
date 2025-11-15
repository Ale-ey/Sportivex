import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { registerSchema, type RegisterFormData } from "../validator/auth.validator";
import { authService } from "../services/authService";

export const useSignUp = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState,
    reset,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      cmsId: "",
      role: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const payload = {
      fullName: data.fullName,
      email: data.email.toLowerCase().trim(),
      password: data.password,
      cmsId: data.cmsId,
      role: data.role,
    };

    const response = await authService.register(payload);
    if (response) {
      console.log("Registration successful:", response);
      reset();
      navigate("/dashboard");
    }
  };

  return {
    register,
    handleSubmit,
    formState,
    onSubmit,
    watch,
    reset,
  };
};

