"use client"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';

export default function TwoPointers() {
 const [nums, setNums] = useState("")
 const [target, setTarget] = useState("")
 const [ans, setAns] = useState<{ positions: number[]; values: number[] } | null>(null)

 const handleChangeNums = (e: React.ChangeEvent<HTMLInputElement>) => {
  setNums(e.target.value)
 }

 const handleChangeTarget = (e: React.ChangeEvent<HTMLInputElement>) => {
  setTarget(e.target.value)
 }

 const isDisabled = !nums || !target

 const twoSumSorted = (numbers: number[], target: number) => {
  let left = 0
  let right = numbers.length - 1

  while (left < right) {
   const currentSum = numbers[left] + numbers[right]

   if (currentSum === target) {
    return [left + 1, right + 1]
   } else if (currentSum < target) {
    left++
   } else {
    right--
   }
  }

  return []
 }

 const findSumOfTwo = () => {
  if (isDisabled) return

  const values = nums
   .split(/[\s,]+/)
   .filter(Boolean)
   .map(Number)
   .filter((n) => !Number.isNaN(n))
   .sort((a, b) => a - b)

  const positions = twoSumSorted(values, Number(target))
  const pair = positions.map((p) => values[p - 1])

  setAns({ positions, values: pair })
 }

 return (
  <Card>
   <CardHeader>
    <CardTitle>
     Two Pointer Method
    </CardTitle>
    <CardDescription>
     Questions for Two Pointers
    </CardDescription>
    <div className='flex gap-2 pt-2'>
     <Badge variant='default' className='h-7 px-3 text-sm'>Time: O(n)</Badge>
     <Badge variant='default' className='h-7 px-3 text-sm'>Space: O(1)</Badge>
    </div>
   </CardHeader>
   <CardContent className='space-y-2'>
    <p>
     <span className='text-orange-400'>Problem</span> : Given a sorted array of integers nums and an integer target, return the positions of the two numbers that add up to target.
    </p>
    <p>
     <span className='text-sky-500'>Example</span> : nums = [ 1, 2, 4, 5, 6, 7 ], target = 10 → Answer = [ 3 : 5 ]
    </p>

    <h1 className='text-emerald-500'>Explanation</h1>
    <p className='bg-lime-200 text-black font-medium p-3 rounded-lg'>
     Place one pointer on the first number (left) and one on the last number (right).
     Add the two values together. If the sum is smaller than the target, move the left pointer forward.
     If the sum is bigger than the target, move the right pointer backward.
     If the sum equals the target, we found the answer.
     Because the array is sorted, each step safely removes one number and never needs to go back, so it runs in O(n) time.
    </p>

    <p className='text-green-500'>Ans = {ans ? (ans.positions.length > 0 ? `[${ans.positions.join(' : ')}]` : 'Not found') : '—'}</p>

    <FieldGroup className='pt-2'>
     <FieldSet>
      <FieldLabel>Enter Values</FieldLabel>
      <Input value={nums} onChange={handleChangeNums} placeholder='example: 8, 4, 2, 1, 3, 5, 7, 6' />
     </FieldSet>
     <FieldSet>
      <FieldLabel>Enter Target</FieldLabel>
      <Input value={target} onChange={handleChangeTarget} placeholder='example: 10' type='number' />
     </FieldSet>
    </FieldGroup>

    {ans && (
     ans.positions.length > 0 ? (
      <p className="font-semibold text-xl">
       {ans.values[0]} + {ans.values[1]} = {target} at positions [{ans.positions.join(' : ')}]
      </p>
     ) : (
      <p className="font-semibold text-xl">No two values add up to {target}</p>
     )
    )}
   </CardContent>
   <CardFooter className='flex flex-col items-start gap-2'>
    <p className='font-medium'>
     This two pointer method uses the same target idea as the two-sum problem, but it works only on a sorted array and uses no extra memory. Hashing finds the pair in any order but stores values in a map, while two pointers is faster to write and uses O(1) extra space.
    </p>
    <p className='bg-sky-200 text-black font-medium p-3 rounded-lg w-full'>
     <span className='text-emerald-600 font-semibold'>Advantage of Two Pointers</span> : Two pointers uses no extra memory (O(1) space).
     It needs only two index variables, while hashing stores every value in a map (O(n) space).
    </p>
   </CardFooter>
   <CardFooter className='justify-end'>
    <Button disabled={isDisabled} type='button' onClick={findSumOfTwo}>
     Find ans
    </Button>
   </CardFooter>
  </Card>
 );
}
