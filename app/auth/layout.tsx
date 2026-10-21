import React from 'react';
import Link from 'next/link';
import { CheckCircle2, LockKeyhole, Zap } from 'lucide-react';
import { ModeToggle } from '@/components/ui/dark-mode-switcher';
import { AuthDecoration } from '@/modules/auth/components/auth-decoration';
import { cacheLife } from 'next/cache';

const highlights = [
 'Multi-factor authentication',
 'Secure session management',
 'Enterprise-grade protection',
];

async function getCurrentYear() {
 'use cache';
 cacheLife('max');
 return new Date().getFullYear();
}


export default async function AuthLayout({ children }: { children: React.ReactNode }) {
 const currentYear = await getCurrentYear();


 return (
  <section className='grid min-h-svh w-full lg:grid-cols-[1.05fr_1fr]'>
   <aside className='relative hidden flex-col justify-between overflow-hidden border-r bg-primary/[0.03] p-10 lg:flex'>
    <AuthDecoration />

    <div className='relative z-10 flex flex-col gap-12'>
     <Link href='/' className='inline-flex w-fit items-center gap-2.5'>
      <span className='flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm'>
       <Zap className='size-5' />
      </span>
      <span className='font-heading text-lg font-semibold tracking-tight'>FastAPI</span>
     </Link>

     <div className='max-w-md space-y-5'>
      <h2 className='font-heading text-3xl font-semibold tracking-tight text-balance'>
       Build and ship with confidence.
      </h2>
      <p className='text-pretty text-muted-foreground'>
       A secure, modern authentication experience built for your application and your users.
      </p>
      <ul className='space-y-3 pt-2'>
       {highlights.map((highlight) => (
        <li key={highlight} className='flex items-center gap-3 text-sm'>
         <CheckCircle2 className='size-4 shrink-0 text-primary' />
         <span>{highlight}</span>
        </li>
       ))}
      </ul>
     </div>
    </div>

    <p className='relative z-10 text-sm text-muted-foreground'>
     © {currentYear} FastAPI. All rights reserved.
    </p>
   </aside>

   <div className='relative flex min-h-svh flex-col bg-background'>
    <header className='flex items-center justify-between p-5 sm:p-6 lg:justify-end'>
     <Link href='/' className='inline-flex items-center gap-2 lg:hidden'>
      <span className='flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
       <Zap className='size-4' />
      </span>
      <span className='font-heading text-base font-semibold tracking-tight'>FastAPI</span>
     </Link>
     <ModeToggle />
    </header>

    <main className='flex flex-1 items-center justify-center px-4 pb-10 sm:px-6'>
     <div className='w-full max-w-md'>{children}</div>
    </main>

    <footer className='flex items-center justify-center gap-2 px-4 pb-6 text-center text-xs text-muted-foreground sm:px-6'>
     <LockKeyhole className='size-3.5' />
     <span>Secure authentication. Your data is protected.</span>
    </footer>
   </div>
  </section>
 );
}
