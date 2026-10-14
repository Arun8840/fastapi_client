'use client'

import { useState } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react"
import { useAuthMutations } from "@/service/mutations"
import { getApiErrorMessage } from "@/service/controller/api-client"
import { toast } from "@/components/ui/toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Field, FieldContent, FieldError, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Spinner } from "@/components/ui/spinner"
import { VerifyMfaInputType, VerifyMfaSchema } from "./schema.verify-mfa"


const toastHandler = (type: "success" | "error", message: string) => {
 toast.add({
  type,
  description: message
 })
}

const OTP_SLOT_IDS = [0, 1, 2, 3, 4, 5]

export default function VerifyMfaClient() {

 const navigation = useRouter()
 const { verifyMfa } = useAuthMutations()
 const [useBackupCode, setUseBackupCode] = useState(false)
 const form = useForm<VerifyMfaInputType>({
  defaultValues: {
   code: "",
  },
  resolver: zodResolver(VerifyMfaSchema)
 })
 const codeError = form.formState.errors.code
 const isPending = verifyMfa.isPending || form.formState.isSubmitting

 const handleVerify: SubmitHandler<VerifyMfaInputType> = (data) => {
  verifyMfa.mutate(data, {
   onSuccess(data) {
    toastHandler("success", data?.message || "Login successfully")
    navigation.push("/")
   },
   onError(error) {
    toastHandler("error", getApiErrorMessage(error))
    form.reset({ code: "" })
   },
  })
 }

 const toggleBackupCode = () => {
  setUseBackupCode((value) => !value)
  form.reset({ code: "" })
 }

 return (
  <form className="w-full max-w-md" onSubmit={form.handleSubmit(handleVerify)}>
   <Card>
    <CardHeader>
     <CardTitle className="flex items-center gap-2">
      <ShieldCheck /> Two-factor authentication
     </CardTitle>
     <CardDescription>
      {useBackupCode
       ? "Enter one of your saved backup codes"
       : "Enter the 6-digit code from your authenticator app"}
     </CardDescription>
    </CardHeader>
    <CardContent>
     <FieldSet>
      <Controller
       control={form.control}
       name="code"
       render={({ field }) => {
        return <Field>
         <FieldLabel>{useBackupCode ? "Backup code" : "Verification code"}</FieldLabel>
         <FieldContent>
          {useBackupCode ? (
           <Input {...field} placeholder="Enter your backup code"
            autoComplete='one-time-code'
            autoCapitalize='none'
            spellCheck={false}
            aria-invalid={Boolean(codeError)}
            aria-describedby={codeError ? 'verify-mfa-code-error' : undefined}
           />
          ) : (
           <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            value={field.value}
            onChange={field.onChange}
            onComplete={() => form.handleSubmit(handleVerify)()}
            disabled={isPending}
           >
            <InputOTPGroup>
             {OTP_SLOT_IDS.map((slot) => (
              <InputOTPSlot key={slot} index={slot} />
             ))}
            </InputOTPGroup>
           </InputOTP>
          )}
         </FieldContent>
         {codeError && (
          <FieldError id='verify-mfa-code-error' errors={[codeError]} className='text-[#B42318]' />
         )}
        </Field>
       }}
      />
     </FieldSet>
    </CardContent>
    <CardFooter className="justify-between gap-2">
     <Button size={"lg"} type="button" variant={"ghost"} onClick={toggleBackupCode}>
      <KeyRound /> {useBackupCode ? "Use authenticator" : "Use backup code"}
     </Button>
     <Button size={"lg"} type="submit" disabled={isPending}>{isPending ? <>
      <Spinner /> Verifying...
     </> :
      "Verify"
     }</Button>
    </CardFooter>
   </Card>
   <div className='mt-4 text-center'>
    <Link href={"/auth/login"} className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'>
     <ArrowLeft className='size-4' /> Back to login
    </Link>
   </div>
  </form>
 );
}
