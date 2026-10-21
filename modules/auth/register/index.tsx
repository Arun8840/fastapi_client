'use client'

import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { RegisterInputType, RegisterSchema } from "./schema.register";
import { AuthCardHeader } from "../components/auth-card-header";
import { useAuthMutations } from "@/service/mutations";
import { toast } from "@/components/ui/toast";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlusIcon } from "lucide-react";
import { Field, FieldContent, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation";
import Link from "next/link";


const toastHandler = (type: "success" | "error", message: string) => {
 toast.add({
  type,
  description: message
 })
}

export default function RegisterClient() {

 const navigation = useRouter()
 const { register } = useAuthMutations()
 const form = useForm<RegisterInputType>({
  defaultValues: {
   email: "",
   password: "",
   name: "",
   confirmPassword: "",
  },
  resolver: zodResolver(RegisterSchema)
 })
 const emailError = form.formState.errors.email;
 const passwordError = form.formState.errors.password;
 const nameError = form.formState.errors.name;
 const confirmPasswordError = form.formState.errors.confirmPassword;
 const isPending = register.isPending || form.formState.isSubmitting

 const handleRegister: SubmitHandler<RegisterInputType> = (data) => {
  register.mutate(data, {
   onSuccess(data) {
    toastHandler("success", data?.message || "Register successfully")
    navigation.push("/auth/login")
   },
   onError(error) {
    toastHandler("error", error?.message || "Register failed")
   },
  })
 }
 return (
  <form className="w-full max-w-md" onSubmit={form.handleSubmit(handleRegister)}>
   <Card>
    <CardHeader>
     <AuthCardHeader
      icon={UserPlusIcon}
      eyebrow="Get started"
      title="Create your account"
      description="Fill in your details below to set up a new account."
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
           aria-describedby={emailError ? 'register-email-error' : undefined}
          />
         </FieldContent>
         {emailError && (
          <FieldError id='register-email-error' errors={[emailError]} className='text-[#B42318]' />
         )}
        </Field>
       }}
      />
      <Controller
       control={form.control}
       name="name"
       render={({ field }) => {
        return <Field>
         <FieldLabel>Name</FieldLabel>
         <FieldContent>
          <Input {...field} placeholder="Enter your name"
           autoComplete='name'
           autoCapitalize='words'
           spellCheck={false}
           aria-invalid={Boolean(nameError)}
           aria-describedby={nameError ? 'register-name-error' : undefined}
          />
         </FieldContent>
         {nameError && (
          <FieldError id='register-name-error' errors={[nameError]} className='text-[#B42318]' />
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
          <Input {...field} placeholder="Enter your password"
           type="password"
           aria-invalid={Boolean(passwordError)}
           aria-describedby={passwordError ? 'register-password-error' : undefined}
          />
         </FieldContent>
         {passwordError && (
          <FieldError id='register-password-error' errors={[passwordError]} className='text-[#B42318]' />
         )}
        </Field>
       }}
      />
      <Controller
       control={form.control}
       name="confirmPassword"
       render={({ field }) => {
        return <Field>
         <FieldLabel>Confirm Password</FieldLabel>
         <FieldContent>
          <Input {...field} placeholder="Enter your confirm password"
           type="password"
           aria-invalid={Boolean(confirmPasswordError)}
           aria-describedby={confirmPasswordError ? 'register-confirm-password-error' : undefined}
          />
         </FieldContent>
         {confirmPasswordError && (
          <FieldError id='register-confirm-password-error' errors={[confirmPasswordError]} className='text-[#B42318]' />
         )}
        </Field>
       }}
      />
     </FieldSet>
    </CardContent>
    <CardFooter className="justify-end gap-2">
     <Button size={"lg"} type="button" variant={"secondary"}
      nativeButton={false}
      render={<Link href={"/auth/login"}>
       <ArrowLeft />Back to login
      </Link>}
     />
     <Button size={"lg"} type="submit" disabled={isPending}>{isPending ? <>
      <Spinner /> Registering...
     </> : <>
      <UserPlusIcon /> Register
     </>}</Button>
    </CardFooter>
   </Card>
  </form>
 );
}