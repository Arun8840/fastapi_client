export type RoleStatus = "admin" | "user"

export interface User {
 id: string
 email: string
 role: RoleStatus
 mfa_enabled: boolean
 mfa_verified: boolean
}

export interface LoginData {
 user: User | null
 mfa_required: boolean
}

export interface MfaSetupData {
 secret: string
 qr_code: string
}

export interface MfaBackupCodesData {
 backup_codes: string[]
}
