"use client"
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
     Find two values whose sum equals the target using the two pointer method.
    </CardDescription>
   </CardHeader>
   <CardContent>
    <FieldGroup>
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
      <p className="mt-4 font-semibold text-xl">
       {ans.values[0]} + {ans.values[1]} = {target} at positions [{ans.positions.join(' : ')}]
      </p>
     ) : (
      <p className="mt-4 font-semibold text-xl">No two values add up to {target}</p>
     )
    )}
   </CardContent>
   <CardFooter className='justify-end'>
    <Button disabled={isDisabled} type='button' onClick={findSumOfTwo}>
     Find ans
    </Button>
   </CardFooter>
  </Card>
 );
}
