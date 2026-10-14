'use client'

import { useState } from "react"
import { Control, Controller, SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import Link from "next/link"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { ArrowLeft, CheckCircle2, Copy, RefreshCw, ShieldCheck, ShieldOff } from "lucide-react"
import { useAuthMutations } from "@/service/mutations"
import { useCurrentUser } from "@/service/query"
import { getApiErrorMessage } from "@/service/controller/api-client"
import { authKeys } from "@/service/keys/auth-keys"
import { toast } from "@/components/ui/toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldError, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Spinner } from "@/components/ui/spinner"
import { MfaSetupData } from "@/types"
import {
 DisableMfaInputType,
 DisableMfaSchema,
 EnableMfaInputType,
 EnableMfaSchema,
 MfaCodeInputType,
 MfaCodeSchema,
 RegenerateBackupCodesInputType,
 RegenerateBackupCodesSchema,
} from "./schema.mfa"


const toastHandler = (type: "success" | "error", message: string) => {
 toast.add({
  type,
  description: message
 })
}

const OTP_SLOT_IDS = [0, 1, 2, 3, 4, 5]

function CodeInput({ control, error, disabled }: {
 control: Control<MfaCodeInputType>,
 error?: { message?: string },
 disabled: boolean
}) {
 return (
  <Controller
   control={control}
   name="code"
   render={({ field }) => {
    return <Field>
     <FieldLabel>Verification code</FieldLabel>
     <FieldContent>
      <InputOTP
       maxLength={6}
       pattern={REGEXP_ONLY_DIGITS}
       value={field.value}
       onChange={field.onChange}
       disabled={disabled}
      >
       <InputOTPGroup>
        {OTP_SLOT_IDS.map((slot) => (
         <InputOTPSlot key={slot} index={slot} />
        ))}
       </InputOTPGroup>
      </InputOTP>
     </FieldContent>
     {error && (
      <FieldError errors={[error]} className='text-[#B42318]' />
     )}
    </Field>
   }}
  />
 )
}

function BackupCodeList({ codes }: { codes: string[] }) {
 const [copied, setCopied] = useState(false)

 const copyCodes = async () => {
  await navigator.clipboard.writeText(codes.join("\n"))
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
 }

 return (
  <div className='space-y-3'>
   <div className='grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 p-3 font-mono text-sm'>
    {codes.map((code) => (
     <span key={code}>{code}</span>
    ))}
   </div>
   <Button size={"sm"} type="button" variant={"outline"} onClick={copyCodes}>
    {copied ? <CheckCircle2 /> : <Copy />} {copied ? "Copied" : "Copy codes"}
   </Button>
  </div>
 )
}

function EnableMfaPanel({ onBackupCodes }: { onBackupCodes: (codes: string[]) => void }) {
 const queryClient = useQueryClient()
 const { enableMfa, verifyMfaSetup } = useAuthMutations()
 const [setup, setSetup] = useState<MfaSetupData | null>(null)

 const passwordForm = useForm<EnableMfaInputType>({
  defaultValues: { password: "" },
  resolver: zodResolver(EnableMfaSchema),
 })
 const codeForm = useForm<MfaCodeInputType>({
  defaultValues: { code: "" },
  resolver: zodResolver(MfaCodeSchema),
 })
 const passwordError = passwordForm.formState.errors.password

 const handleEnable: SubmitHandler<EnableMfaInputType> = (data) => {
  enableMfa.mutate(data, {
   onSuccess(res) {
    toastHandler("success", res?.message || "Scan the QR code, then verify")
    setSetup(res.data)
    passwordForm.reset()
   },
   onError(error) {
    toastHandler("error", getApiErrorMessage(error))
   },
  })
 }

 const handleVerify: SubmitHandler<MfaCodeInputType> = (data) => {
  verifyMfaSetup.mutate(data, {
   onSuccess(res) {
    toastHandler("success", res?.message || "MFA activated successfully")
    onBackupCodes(res.data.backup_codes)
    queryClient.invalidateQueries({ queryKey: authKeys.me })
   },
   onError(error) {
    toastHandler("error", getApiErrorMessage(error))
    codeForm.reset({ code: "" })
   },
  })
 }

 if (!setup) {
  const isPending = enableMfa.isPending || passwordForm.formState.isSubmitting
  return (
   <form onSubmit={passwordForm.handleSubmit(handleEnable)}>
    <Card>
     <CardHeader>
      <CardTitle className='flex items-center gap-2'>
       <ShieldCheck /> Enable two-factor authentication
      </CardTitle>
      <CardDescription>Confirm your password to begin setting up MFA</CardDescription>
     </CardHeader>
     <CardContent>
      <FieldSet>
       <Controller
        control={passwordForm.control}
        name="password"
        render={({ field }) => {
         return <Field>
          <FieldLabel>Password</FieldLabel>
          <FieldContent>
           <Input {...field} placeholder="Enter your password"
            type='password'
            autoComplete='current-password'
            aria-invalid={Boolean(passwordError)}
           />
          </FieldContent>
          {passwordError && (
           <FieldError errors={[passwordError]} className='text-[#B42318]' />
          )}
         </Field>
        }}
       />
      </FieldSet>
     </CardContent>
     <CardFooter className="justify-end">
      <Button size={"lg"} type="submit" disabled={isPending}>{isPending ? <>
       <Spinner /> Starting...
      </> :
       "Continue"
      }</Button>
     </CardFooter>
    </Card>
   </form>
  )
 }

 const isVerifying = verifyMfaSetup.isPending || codeForm.formState.isSubmitting
 return (
  <form onSubmit={codeForm.handleSubmit(handleVerify)}>
   <Card>
    <CardHeader>
     <CardTitle className='flex items-center gap-2'>
      <ShieldCheck /> Scan the QR code
     </CardTitle>
     <CardDescription>
      Scan this with your authenticator app, then enter the generated code
     </CardDescription>
    </CardHeader>
    <CardContent className='space-y-4'>
     <div className='flex justify-center'>
      <Image src={setup.qr_code} alt='MFA QR code' width={200} height={200} unoptimized className='rounded-lg border' />
     </div>
     <div className='space-y-1'>
      <p className='text-sm text-muted-foreground'>Or enter this secret manually</p>
      <code className='block rounded-lg border bg-muted/40 p-2 text-center font-mono text-sm break-all'>{setup.secret}</code>
     </div>
     <FieldSet>
      <CodeInput control={codeForm.control} error={codeForm.formState.errors.code} disabled={isVerifying} />
     </FieldSet>
    </CardContent>
    <CardFooter className="justify-end">
     <Button size={"lg"} type="submit" disabled={isVerifying}>{isVerifying ? <>
      <Spinner /> Verifying...
     </> :
      "Activate MFA"
     }</Button>
    </CardFooter>
   </Card>
  </form>
 )
}

function EnabledMfaPanel({ backupCodes, onBackupCodes }: {
 backupCodes: string[] | null,
 onBackupCodes: (codes: string[] | null) => void
}) {
 const queryClient = useQueryClient()
 const { regenerateBackupCodes, disableMfa } = useAuthMutations()

 const regenerateForm = useForm<RegenerateBackupCodesInputType>({
  defaultValues: { password: "" },
  resolver: zodResolver(RegenerateBackupCodesSchema),
 })
 const disableForm = useForm<DisableMfaInputType>({
  defaultValues: { password: "", code: "" },
  resolver: zodResolver(DisableMfaSchema),
 })
 const regeneratePasswordError = regenerateForm.formState.errors.password
 const disablePasswordError = disableForm.formState.errors.password

 const handleRegenerate: SubmitHandler<RegenerateBackupCodesInputType> = (data) => {
  regenerateBackupCodes.mutate(data, {
   onSuccess(res) {
    toastHandler("success", res?.message || "Backup codes regenerated")
    onBackupCodes(res.data.backup_codes)
    regenerateForm.reset()
   },
   onError(error) {
    toastHandler("error", getApiErrorMessage(error))
   },
  })
 }

 const handleDisable: SubmitHandler<DisableMfaInputType> = (data) => {
  disableMfa.mutate(data, {
   onSuccess(res) {
    toastHandler("success", res?.message || "MFA disabled successfully")
    onBackupCodes(null)
    disableForm.reset()
    queryClient.invalidateQueries({ queryKey: authKeys.me })
   },
   onError(error) {
    toastHandler("error", getApiErrorMessage(error))
    disableForm.reset({ password: "", code: "" })
   },
  })
 }

 const isRegenerating = regenerateBackupCodes.isPending || regenerateForm.formState.isSubmitting
 const isDisabling = disableMfa.isPending || disableForm.formState.isSubmitting

 return (
  <div className='w-full max-w-md space-y-4'>
   <Card>
    <CardHeader>
     <CardTitle className='flex items-center gap-2'>
      <ShieldCheck className='text-green-600' /> MFA is active
     </CardTitle>
     <CardDescription>Your account is protected with an authenticator app</CardDescription>
    </CardHeader>
    <CardContent className='space-y-4'>
     {backupCodes && (
      <div className='space-y-2'>
       <p className='text-sm font-medium'>Your new backup codes</p>
       <p className='text-sm text-muted-foreground'>
        Store these somewhere safe. Each code can be used once.
       </p>
       <BackupCodeList codes={backupCodes} />
      </div>
     )}
     <form className='space-y-3' onSubmit={regenerateForm.handleSubmit(handleRegenerate)}>
      <p className='text-sm font-medium'>Regenerate backup codes</p>
      <Controller
       control={regenerateForm.control}
       name="password"
       render={({ field }) => {
        return <Field>
         <FieldContent>
          <Input {...field} placeholder="Confirm your password"
           type='password'
           autoComplete='current-password'
           aria-invalid={Boolean(regeneratePasswordError)}
          />
         </FieldContent>
         {regeneratePasswordError && (
          <FieldError errors={[regeneratePasswordError]} className='text-[#B42318]' />
         )}
        </Field>
       }}
      />
      <Button size={"sm"} type="submit" variant={"outline"} disabled={isRegenerating}>{isRegenerating ? <>
       <Spinner /> Regenerating...
      </> : <>
       <RefreshCw /> Regenerate
      </>}</Button>
     </form>
    </CardContent>
   </Card>

   <Card>
    <CardHeader>
     <CardTitle className='flex items-center gap-2'>
      <ShieldOff className='text-destructive' /> Disable MFA
     </CardTitle>
     <CardDescription>Confirm your password and a current code to turn MFA off</CardDescription>
    </CardHeader>
    <CardContent>
     <form onSubmit={disableForm.handleSubmit(handleDisable)}>
      <FieldSet>
       <Controller
        control={disableForm.control}
        name="password"
        render={({ field }) => {
         return <Field>
          <FieldLabel>Password</FieldLabel>
          <FieldContent>
           <Input {...field} placeholder="Enter your password"
            type='password'
            autoComplete='current-password'
            aria-invalid={Boolean(disablePasswordError)}
           />
          </FieldContent>
          {disablePasswordError && (
           <FieldError errors={[disablePasswordError]} className='text-[#B42318]' />
          )}
         </Field>
        }}
       />
       <CodeInput control={disableForm.control as unknown as Control<MfaCodeInputType>} error={disableForm.formState.errors.code} disabled={isDisabling} />
      </FieldSet>
      <div className='mt-4 flex justify-end'>
       <Button size={"lg"} type="submit" variant={"destructive"} disabled={isDisabling}>{isDisabling ? <>
        <Spinner /> Disabling...
       </> :
        "Disable MFA"
       }</Button>
      </div>
     </form>
    </CardContent>
   </Card>
  </div>
 )
}

export default function MfaClient() {

 const { data, isLoading, isError } = useCurrentUser()
 const [backupCodes, setBackupCodes] = useState<string[] | null>(null)

 if (isLoading) {
  return <Card className='w-full max-w-md'>
   <CardContent className='flex items-center justify-center gap-2 py-10 text-muted-foreground'>
    <Spinner /> Loading your MFA settings...
   </CardContent>
  </Card>
 }

 if (isError || !data?.data) {
  return <Card className='w-full max-w-md'>
   <CardHeader>
    <CardTitle>Session expired</CardTitle>
    <CardDescription>Please log in again to manage your MFA settings</CardDescription>
   </CardHeader>
   <CardFooter className="justify-end">
    <Button size={"lg"} nativeButton={false} render={<Link href={"/auth/login"}>
     <ArrowLeft /> Back to login
    </Link>} />
   </CardFooter>
  </Card>
 }

 const user = data.data
 const isEnabled = user.mfa_enabled && user.mfa_verified

 return (
  <div className='w-full max-w-md space-y-4'>
   <h1 className='text-lg font-semibold'>Two-factor authentication</h1>
   {isEnabled ? (
    <EnabledMfaPanel backupCodes={backupCodes} onBackupCodes={setBackupCodes} />
   ) : (
    <EnableMfaPanel onBackupCodes={setBackupCodes} />
   )}
   <div className='text-center'>
    <Link href={"/"} className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'>
     <ArrowLeft className='size-4' /> Back to home
    </Link>
   </div>
  </div>
 )
}
