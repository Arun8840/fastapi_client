import BinarySearch from './binary-search';
import ReverseStringFormatter from './reverse-string';
import TwoPointers from './two-pointers';

export default function PracticesRoot() {

 return (
  <section className='grid lg:grid-cols-3 auto-rows-max *:h-fit gap-3 p-3'>
   <ReverseStringFormatter />
   <TwoPointers />
   <BinarySearch />
  </section>
 );
}