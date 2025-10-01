import { http } from "./http";
import { AuthResponse } from "./types";

export const GetCryptoList = async ({ page = 1 }: { page: number }): Promise<AuthResponse> => {
  try {
    const response = await http(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/crypto/prices/latest/?page=${page}&page_size=25`,
      "GET"
    );
    return response;
  } catch (error) {
    console.error(error);
    return { success: false, error: "دریافت اطلاعات" };
  }
};

export const GetCryptoHistory7d = async (symbols: string[]): Promise<AuthResponse> => {
  try {
    const joined = symbols.join(",");
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/crypto/prices/history/?limit=8&symbols=${encodeURIComponent(
      joined
    )}`;
    const response = await http(url, "GET");
    return response;
  } catch (error) {
    console.error(error);
    return { success: false, error: "دریافت تاریخچه قیمت" };
  }
};
