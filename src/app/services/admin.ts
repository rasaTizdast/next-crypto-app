import { http } from "./http";

interface UpgradePremiumPayload {
  email: string;
  days: number;
}

interface UpgradePremiumResponse {
  success: boolean;
  message?: string;
  detail?: string;
  error?: string;
}

export const upgradeUserToPremium = async (
  payload: UpgradePremiumPayload
): Promise<UpgradePremiumResponse> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/premium/upgrade/`;
    const response = await http(url, "POST", payload);

    if (!response.success) {
      return {
        success: false,
        error: response.error || "درخواست ناموفق بود",
      };
    }

    const data = response.data as { message?: string; detail?: string };
    return {
      success: true,
      message: data?.message,
      detail: data?.detail,
    };
  } catch (error) {
    console.error("upgradeUserToPremium error", error);
    return { success: false, error: "خطایی رخ داد" };
  }
};
