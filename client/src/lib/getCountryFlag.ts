import exp from "constants";

const getCountryFlagUrl = (countryCode: string | null): string => {
  if (!countryCode) return "https://flagcdn.com/w40/un.png"; // mặc định: Liên Hợp Quốc

  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
};

export default getCountryFlagUrl;
