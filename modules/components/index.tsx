"use client"
import GradientGenerator from './gradient-generator';

export default function ComponentsRoot() {
 return (
  <section className='p-4'>
   <GradientGenerator onChange={(e) => console.log(e)} />
  </section>
 );
}