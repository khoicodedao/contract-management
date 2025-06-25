// Contract status constants
export const CONTRACT_STATUS = {
  ACTIVE: 1,
  COMPLETED: 2,
  PAUSED: 3,
} as const;

export const CONTRACT_STATUS_LABELS = {
  [CONTRACT_STATUS.ACTIVE]: "Đang thực hiện",
  [CONTRACT_STATUS.COMPLETED]: "Hoàn thành", 
  [CONTRACT_STATUS.PAUSED]: "Tạm dừng",
} as const;

export const CONTRACT_STATUS_COLORS = {
  [CONTRACT_STATUS.ACTIVE]: "bg-yellow-100 text-yellow-800",
  [CONTRACT_STATUS.COMPLETED]: "bg-green-100 text-green-800",
  [CONTRACT_STATUS.PAUSED]: "bg-red-100 text-red-800",
} as const;

// File types for upload
export const ALLOWED_FILE_TYPES = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
] as const;

export const FILE_TYPE_LABELS = {
  ".pdf": "PDF",
  ".doc": "Word",
  ".docx": "Word",
  ".xls": "Excel",
  ".xlsx": "Excel",
} as const;

// Max file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Date format
export const DATE_FORMAT = "dd/MM/yyyy";

// Currency
export const CURRENCY_SYMBOLS = {
  VND: "₫",
  USD: "$",
  EUR: "€",
} as const;

// Progress status
export const PROGRESS_STATUS = {
  NOT_STARTED: "chưa thực hiện",
  IN_PROGRESS: "đang thực hiện", 
  COMPLETED: "hoàn thành",
  OVERDUE: "quá hạn",
} as const;

export const PROGRESS_STATUS_COLORS = {
  [PROGRESS_STATUS.NOT_STARTED]: "bg-gray-100 text-gray-800",
  [PROGRESS_STATUS.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [PROGRESS_STATUS.COMPLETED]: "bg-green-100 text-green-800",
  [PROGRESS_STATUS.OVERDUE]: "bg-red-100 text-red-800",
} as const;
