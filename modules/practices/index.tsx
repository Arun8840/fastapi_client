"use client"
import BinarySearch from './binary-search';
import CharacterCounter from './char-counter';
import Hashing from './hashing';
import ReverseStringFormatter from './reverse-string';
import SlidingWindow from './sliding-window';
import TwoPointers from './two-pointers';

export default function PracticesRoot() {

 const nums = [8, 4, 9, 10, 3, 2, 1]

 const sw = 4

 let window = 0
 const findMax = () => {

  for (let index = 0;index < sw;index++) {
   window += nums[index]
  }

  let max = window

  for (let index = sw;index < nums.length;index++) {
   window += nums[index] - nums[index - sw]

   if (window > max) {
    max = window
   }

   return max
  }
 }

 console.log(findMax())

 return (
  <section className='p-3'>
   <div className='w-full lg:max-w-5xl lg:mx-auto space-y-4'>
    <CharacterCounter />
    <ReverseStringFormatter />
    <Hashing />
    <TwoPointers />
    <SlidingWindow />
    <BinarySearch />
   </div>
  </section>
 );
}