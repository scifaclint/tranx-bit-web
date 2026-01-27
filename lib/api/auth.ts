import { toast } from "sonner";
import api from "./axios";

export interface LoginCredentials {
  identifier: string;
  identifierType: "email" | "username";
  password: string;
}

export interface RegisterCredentials {
  username: string;
  lastName: string;
  firstName: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  country?: string;
  code?: string;
  referral_username?: string
}

export interface RegisterResponse {
  status: boolean;
  error?: string;
  message?: string;
  data: {
    to: string;
    token: string;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      is_verified: boolean;
      created_at: string;
      updated_at: string;
      ip_address: string;
      user_agent: string;
      registration_type: string;
      email_verified_at?: string | null;
    };
  };
}

export interface AuthResponse {
  status: boolean;
  data: {
    user: User;
    is_verified: boolean;
    to: string;
  };
  message: string;
  plan: string | null;
}

export interface LoginResponse {
  status: boolean;
  error?: string;
  data: {
    to: string;
    token: string;
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      is_verified: boolean;
      created_at: string;
      updated_at: string;
      ip_address: string;
      user_agent: string;
      registration_type: string;
      email_verified_at?: string | null;
      survey_remind?: boolean;
      country?: string;
      kyc_status?: string;
      kyc_submitted_at?: string | null;
      kyc_verified_at?: string | null;
      wallet_balance?: string;
    };
  };
}

interface ForgotPasswordResponse {
  status: boolean;
  message: string;
}

interface ResendVerificationResponse {
  status: boolean;
  message?: string;
  data: {
    to: string;
  };
}

interface DeleteAccountResponse {
  status: boolean;
  message: string;
}

export interface VerifyAdminResponse {
  status: boolean;
  message?: string;
  error?: string;
  data?: {
    userId: number;
    email: string;
    role: string;
  };
}

export interface CheckUsernameResponse {
  status: boolean;
  available: boolean;
  message: string;
  suggestions?: string[];
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  ip_address: string;
  user_agent: string;
  registration_type: string;
  email_verified_at?: string | null;
  photo_url?: string | null;
  pm_type?: string | null;
  pm_last_four?: string | null;
  referral_balance?: string;
  referral_amount_used?: string;
  kyc_status?: string;
  kyc_submitted_at?: string | null;
  kyc_verified_at?: string | null;
  wallet_balance?: string;
  pending_orders_count?: number;
  country?: string;
  role?: string;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  country?: string;
  imageKey?: string;
}

export interface UpdateUserResponse {
  status: boolean;
  message?: string;
  data: {
    user: User;
  };
}

export interface AvatarUploadRequest {
  contentType: string;
}

export interface AvatarUploadResponse {
  status: boolean;
  data: {
    uploadUrl: string;
    key: string;
  };
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", credentials);
    if (!response) {
      throw new Error("Login failed");
    }
    return response.data;
  },

  register: async (
    credentials: RegisterCredentials,
  ): Promise<RegisterResponse> => {
    const response = await api.post("/auth/register", credentials);
    // console.log("register data", response.data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    console.log(response, "logged out");
    return response.data;
  },

  getUser: async (): Promise<AuthResponse> => {
    const response = await api.get("/auth/user");
    // console.log('checked', response.data);
    return response.data;
  },

  verifyEmail: async (data: { code: string; email: string }) => {
    try {
      const response = await api.post("/auth/verify-email", data);
      // console.log('verification data', response);
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to verify email');
      // console.error('Verification API error:', {
      //   status: error.response?.status,
      //   data: error.response?.data,
      //   code: data.code
      // });
      throw error;
    }
  },

  resendVerification: async (data: {
    email: string;
  }): Promise<ResendVerificationResponse> => {
    try {
      const response = await api.post("/auth/resend-verification-code", data);
      if (!response.data.status) {
        toast.error(response.data.message || "Failed to send code");
        throw new Error(response.data.message || "Failed to send code");
      }
      return response.data;
    } catch (error: any) {
      //toast.error(error?.response?.data?.error || error?.response?.data?.message || 'Failed to send code');
      throw error;
    }
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await api.post("/auth/request-password-reset", { email });
    return response.data;
  },

  resetPassword: async (data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  verifyResetToken: async (data: { email: string; token: string }) => {
    const response = await api.post("/auth/verify-reset-token", data);
    return response.data;
  },

  deleteAccount: async (password: string): Promise<DeleteAccountResponse> => {
    const response = await api.post("/delete-account", { password });
    return response.data;
  },

  updateUser: async (data: UpdateUserPayload): Promise<UpdateUserResponse> => {
    const response = await api.put("/auth/updateUser", data);
    return response.data;
  },

  verifyAdmin: async (): Promise<VerifyAdminResponse> => {
    const response = await api.get("/admin/verify");
    return response.data;
  },

  checkUsername: async (username: string): Promise<CheckUsernameResponse> => {
    const response = await api.post("/auth/check-username", { username });
    return response.data;
  },

  requestAvatarUpload: async (data: AvatarUploadRequest): Promise<AvatarUploadResponse> => {
    const response = await api.post("/auth/request-avatar-upload", data);
    return response.data;
  },
};
