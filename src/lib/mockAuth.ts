// Prototype-only local "sign in": no real backend account, no SMS/email --
// just remembers a phone number + profile fields in this browser so the
// sign up/sign in UI has something to show for a demo. Orders placed while
// "signed in" are remembered by code and looked up via the real, already-
// secure fetchOrderByCode. Swap this out for real phone OTP (db.ts already
// has sendPhoneOtp/verifyPhoneOtp) when ready to go live.

const PHONE_KEY = 'bordbar_mock_phone'
const NAME_KEY = 'bordbar_mock_name'
const ADDRESS_KEY = 'bordbar_mock_address'
const POSTAL_KEY = 'bordbar_mock_postal'
const ORDERS_KEY = 'bordbar_mock_order_codes'

export function getMockPhone(): string | null {
  return localStorage.getItem(PHONE_KEY)
}

export function mockSignIn(phone: string): void {
  localStorage.setItem(PHONE_KEY, phone)
}

export function mockSignOut(): void {
  localStorage.removeItem(PHONE_KEY)
  localStorage.removeItem(NAME_KEY)
  localStorage.removeItem(ADDRESS_KEY)
  localStorage.removeItem(POSTAL_KEY)
  localStorage.removeItem(ORDERS_KEY)
}

export function getMockProfile() {
  return {
    phone: localStorage.getItem(PHONE_KEY) ?? '',
    fullName: localStorage.getItem(NAME_KEY) ?? '',
    address: localStorage.getItem(ADDRESS_KEY) ?? '',
    postalCode: localStorage.getItem(POSTAL_KEY) ?? '',
  }
}

export function saveMockProfile(input: { fullName: string; address: string; postalCode: string }): void {
  localStorage.setItem(NAME_KEY, input.fullName)
  localStorage.setItem(ADDRESS_KEY, input.address)
  localStorage.setItem(POSTAL_KEY, input.postalCode)
}

export function getMockOrderCodes(): string[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function rememberMockOrder(code: string): void {
  const codes = getMockOrderCodes()
  if (!codes.includes(code)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify([code, ...codes]))
  }
}
