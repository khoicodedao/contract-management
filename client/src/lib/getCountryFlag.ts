import exp from "constants";

const getCountryFlag = (countryCode: string | null) => {
  if (!countryCode) return "🌐";
  const flags: { [key: string]: string } = {
    VN: "🇻🇳",
    US: "🇺🇸",
    CN: "🇨🇳",
    JP: "🇯🇵",
    KR: "🇰🇷",
    DE: "🇩🇪",
    FR: "🇫🇷",
    GB: "🇬🇧",
    CZ: "🇨🇿",
    IN: "🇮🇳",
    SG: "🇸🇬",
    ES: "🇪🇸",
    IT: "🇮🇹",
    CA: "🇨🇦",
    AU: "🇦🇺",
    TH: "🇹🇭",
    MY: "🇲🇾",
    PH: "🇵🇭",
    ID: "🇮🇩",
    RU: "🇷🇺",
    TR: "🇹🇷",
    NL: "🇳🇱",
    PL: "🇵🇱",
    SE: "🇸🇪",
    NO: "🇳🇴",
    DK: "🇩🇰",
    FI: "🇫🇮",
    CH: "🇨🇭",
    BE: "🇧🇪",
    BR: "🇧🇷",
    AR: "🇦🇷",
    MX: "🇲🇽",
    SA: "🇸🇦",
    AE: "🇦🇪",
    EG: "🇪🇬",
    ZA: "🇿🇦",
    NG: "🇳🇬",
    KE: "🇰🇪",
  };

  return flags[countryCode.toUpperCase()] || "🌐";
};
export default getCountryFlag;
