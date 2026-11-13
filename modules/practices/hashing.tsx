import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

export default function Hashing() {
 const nums = [3, 2, 4]
 const target = 6

 const findTwoSum = () => {
  let seen = new Map()
  for (let index = 0;index < nums.length;index++) {
   const num = nums[index];
   const needed = target - num
   if (seen.has(needed)) {
    return `[${seen.get(needed)} : ${index}]`
   }
   seen.set(num, index)
  }
 }

 const result = findTwoSum()

 return (
  <Card>
   <CardHeader>
    <CardTitle>
     Hashing & Mapping
    </CardTitle>
    <CardDescription>
     Questions for Hashing & Mapping
    </CardDescription>
    <div className='flex gap-2 pt-2'>
     <Badge variant='default' className='h-7 px-3 text-sm'>Time: O(n)</Badge>
     <Badge variant='default' className='h-7 px-3 text-sm'>Space: O(n)</Badge>
    </div>
   </CardHeader>
   <CardContent className='space-y-2'>
    <p>
     <span className='text-orange-400'>Problem</span> : Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.</p>
    <p>
     <span className='text-sky-500'>Example</span> : nums = [ 3, 2, 4 ], target = 6
    </p>

    <h1 className='text-emerald-500'>Explanation</h1>
    <p className='bg-lime-200 text-black font-medium  p-3 rounded-lg'>
     We need to find two numbers in the array that add up to the target.
     this answer returns the index of the num array. the we add the indices to the answer.we get the final target of the array.
    </p>

    <p className='text-green-500'>Ans = {result}</p>
   </CardContent>

   <CardFooter>
    <p className='font-medium'>
     This hashing method same as the two-sum problem. its also same as the three-sum problem. its always uses 1 hashmap for each individual problem. the hashmap should store the value and the index of the value.
    </p>
   </CardFooter>
  </Card>
 );
}