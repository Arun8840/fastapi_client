import MfaClient from '@/modules/auth/mfa';

export default function MfaPage() {
 return (
  <section className='w-full min-h-screen grid place-items-center p-10'>
   <MfaClient />
  </section>
 );
}
