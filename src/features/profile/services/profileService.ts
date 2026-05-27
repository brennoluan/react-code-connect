import { fetchClient } from "../../../lib/fetchClient";
import type { User } from "../../auth/types/auth.types";

interface UpdateProfileData {
  name?: string;
  email?: string;
  password?: string;
  description?: string;
  categories?: string[];
}

interface UpdateProfileResponse {
  user: User;
}

export const profileService = {
  async updateProfile(userId: string, data: UpdateProfileData): Promise<User> {
    const response = await fetchClient.put<UpdateProfileResponse>(
      `/users/${userId}`,
      data,
    );
    return response.user;
  },
};
