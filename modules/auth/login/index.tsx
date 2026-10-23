'use client'

import { useState } from "react"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { useAuthMutations } from "@/service/mutations";
import { getApiErrorMessage } from "@/service/controller/api-client";
import { toast } from "@/components/ui/toast";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, EyeOff, LogIn } from "lucide-react";
import { Field, FieldContent, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoginInputType, LoginSchema } from "./schema.login";
import { AuthCardHeader } from "../components/auth-card-header";


const toastHandler = (type: "success" | "error", message: string) => {
 toast.add({
  type,
  description: message
 })
}

export default function LoginClient() {

 const navigation = useRouter()
 const [showPassword, setShowPassword] = useState(false)
 const { login } = useAuthMutations()
 const form = useForm<LoginInputType>({
  defaultValues: {
   email: "",
   password: "",
  },
  resolver: zodResolver(LoginSchema)
 })
 const emailError = form.formState.errors.email;
 const passwordError = form.formState.errors.password;
 const isPending = login.isPending || form.formState.isSubmitting

 const handlelogin: SubmitHandler<LoginInputType> = (data) => {
  login.mutate(data, {
   onSuccess(data) {
    if (data?.data?.mfa_required) {
     toastHandler("success", "Enter your two-factor code to continue")
     navigation.push("/auth/verify-mfa")
     return
    }
    toastHandler("success", data?.message || "Login successfully")
    navigation.push("/")
   },
   onError(error) {
    toastHandler("error", getApiErrorMessage(error))
   },
  })
 }
 return (
  <form className="w-full max-w-md" onSubmit={form.handleSubmit(handlelogin)}>

   <Card>
    <CardHeader>
     <AuthCardHeader
      icon={LogIn}
      eyebrow="Welcome back"
      title="Sign in to your account"
      description="Enter your email and password to access your dashboard."
     />
    </CardHeader>
    <CardContent>
     <FieldSet>
      <Controller
       control={form.control}
       name="email"
       render={({ field }) => {
        return <Field>
         <FieldLabel>Email</FieldLabel>
         <FieldContent>
          <Input {...field} placeholder="Enter your email"
           inputMode='email'
           autoComplete='email'
           autoCapitalize='none'
           spellCheck={false}
           aria-invalid={Boolean(emailError)}
           aria-describedby={emailError ? 'login-email-error' : undefined}
          />
         </FieldContent>
         {emailError && (
          <FieldError id='login-email-error' errors={[emailError]} className='text-[#B42318]' />
         )}
        </Field>
       }}
      />
      <Controller
       control={form.control}
       name="password"
       render={({ field }) => {
        return <Field>
         <FieldLabel>Password</FieldLabel>
         <FieldContent>
          <InputGroup>
           <InputGroupInput {...field} placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            autoComplete='current-password'
            aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? 'login-password-error' : undefined}
           />
           <InputGroupAddon align='inline-end'>
            <InputGroupButton
             type='button'
             size='icon-xs'
             aria-label={showPassword ? "Hide password" : "Show password"}
             onClick={() => setShowPassword((visible) => !visible)}
            >
             {showPassword ? <EyeOff /> : <Eye />}
            </InputGroupButton>
           </InputGroupAddon>
          </InputGroup>
         </FieldContent>
         {passwordError && (
          <FieldError id='login-password-error' errors={[passwordError]} className='text-[#B42318]' />
         )}
        </Field>
       }}
      />
     </FieldSet>
    </CardContent>
    <CardFooter className="justify-end gap-2">
     <Button size={"lg"} type="button" variant={"secondary"}
      nativeButton={false}
      render={<Link href={"/auth/register"}>
       <ArrowRight />Create Account
      </Link>}
     />
     <Button size={"lg"} type="submit" disabled={isPending}>{isPending ? <>
      <Spinner /> Login...
     </> :
      "Login"
     }</Button>
    </CardFooter>
   </Card>
  </form>
 );
}