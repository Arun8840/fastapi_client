import BinarySearch from './binary-search';
import CharacterCounter from './char-counter';
import Hashing from './hashing';
import ReverseStringFormatter from './reverse-string';
import TwoPointers from './two-pointers';

export default function PracticesRoot() {

 return (
  <section className='p-3'>
   <div className='w-full lg:max-w-5xl lg:mx-auto space-y-4'>
    <CharacterCounter />
    <ReverseStringFormatter />
    <Hashing />
    <TwoPointers />
    <BinarySearch />
   </div>
  </section>
 );
}