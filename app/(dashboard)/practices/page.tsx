import React, { Suspense } from 'react';
import PracticesRoot from '@/modules/practices';
import { Skeleton } from '@/components/ui/skeleton';

function Fallback() {
 return (
  <section className='grid md:grid-cols-6 lg:grid-cols-6 gap-2 *:w-full *:h-20'>
   <Skeleton />
   <Skeleton />
   <Skeleton />
   <Skeleton />
  </section>
 )
}

export default function page() {
 return (
  <Suspense fallback={<Fallback />}>
   <PracticesRoot />
  </Suspense>
 );
}