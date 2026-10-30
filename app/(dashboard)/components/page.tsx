import { Skeleton } from '@/components/ui/skeleton';
import ComponentsRoot from '@/modules/components';
import { Suspense } from 'react';


const FallbackComp = () => {
 return <section className='size-full *:w-full *:h-20 grid grid-cols-4 gap-4'>
  <Skeleton />
  <Skeleton />
  <Skeleton />
  <Skeleton />
 </section>
}

export default function ComponentsPage() {
 return (
  <Suspense fallback={<FallbackComp />}>
   <ComponentsRoot />
  </Suspense>
 );
}