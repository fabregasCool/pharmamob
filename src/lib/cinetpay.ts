import axios from "axios";

let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;

export async function getCinetPayToken() {
  // 🔥 éviter de refaire l'auth à chaque fois
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const res = await axios.post(
    `${process.env.CINETPAY_BASE_URL}/auth/login`,
    {
      api_key: process.env.CINETPAY_API_KEY,
      api_password: process.env.CINETPAY_API_PASSWORD,
    }
  );

  const { access_token, expires_in } = res.data;

  cachedToken = access_token;
  tokenExpiresAt = Date.now() + expires_in * 1000;

  return access_token;
}