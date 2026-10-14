import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
 return (
  <section className='w-full min-h-screen grid place-items-center p-10'>
   {children}
  </section>
 );
}