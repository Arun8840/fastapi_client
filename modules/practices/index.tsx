import BinarySearch from './binary-search';
import Hashing from './hashing';
import ReverseStringFormatter from './reverse-string';
import TwoPointers from './two-pointers';

export default function PracticesRoot() {

 return (
  <section className='p-3'>
   <div className='w-full lg:max-w-5xl lg:mx-auto space-y-4'>
    <ReverseStringFormatter />
    <Hashing />
    <TwoPointers />
    <BinarySearch />
   </div>
  </section>
 );
}