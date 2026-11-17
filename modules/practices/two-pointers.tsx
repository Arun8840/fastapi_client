"use client"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';

type Step = {
 left: number;
 right: number;
 sum: number;
 result: 'found' | 'too-small' | 'too-large';
}

export default function TwoPointers() {
 const [nums, setNums] = useState("")
 const [target, setTarget] = useState("")
 const [parsedNums, setParsedNums] = useState<number[]>([])
 const [steps, setSteps] = useState<Step[]>([])
 const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
 const [foundPositions, setFoundPositions] = useState<number[]>([])
 const [hasSearched, setHasSearched] = useState(false)

 const handleChangeNums = (e: React.ChangeEvent<HTMLInputElement>) => {
  setNums(e.target.value)
 }

 const handleChangeTarget = (e: React.ChangeEvent<HTMLInputElement>) => {
  setTarget(e.target.value)
 }

 const isDisabled = !nums || !target

 const findSumOfTwo = () => {
  if (isDisabled) return

  const values = nums
   .split(/[\s,]+/)
   .filter(Boolean)
   .map(Number)
   .filter((n) => !Number.isNaN(n))
   .sort((a, b) => a - b)

  setParsedNums(values)

  const targetNum = Number(target)
  let left = 0
  let right = values.length - 1
  const computedSteps: Step[] = []
  let positions: number[] = []

  while (left < right) {
   const sum = values[left] + values[right]

   if (sum === targetNum) {
    computedSteps.push({ left, right, sum, result: 'found' })
    positions = [left + 1, right + 1]
    break
   }

   if (sum < targetNum) {
    computedSteps.push({ left, right, sum, result: 'too-small' })
    left++
   } else {
    computedSteps.push({ left, right, sum, result: 'too-large' })
    right--
   }
  }

  setSteps(computedSteps)
  setFoundPositions(positions)
  setCurrentStepIndex(0)
  setHasSearched(true)
 }

 const activeStep = steps[currentStepIndex]

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

    {hasSearched && parsedNums.length > 0 && (
     <div className="space-y-4 pt-2 border-t">
      {/* Visual Array Grid */}
      <div>
       <p className="text-xs font-medium text-muted-foreground mb-2">Array & Pointer Positions:</p>
       <div className="flex flex-wrap gap-1.5">
        {parsedNums.map((num, idx) => {
         const isLeft = activeStep && idx === activeStep.left;
         const isRight = activeStep && idx === activeStep.right;
         const isInRange = activeStep && idx >= activeStep.left && idx <= activeStep.right;
         const isMatch = activeStep?.result === 'found' && (idx === activeStep.left || idx === activeStep.right);

         return (
          <div
           key={idx}
           className={`flex flex-col items-center justify-center w-12 h-14 rounded border text-sm font-semibold transition-all ${isMatch
            ? 'bg-green-600 text-white border-green-600 ring-2 ring-green-400/40'
            : isInRange
             ? 'bg-secondary text-secondary-foreground border-border'
             : 'bg-muted/40 text-muted-foreground border-transparent opacity-40'
            }`}
          >
           <span>{num}</span>
           <span className="text-[10px] font-normal mt-0.5">
            {isLeft && isRight ? 'L R' : isLeft ? 'L' : isRight ? 'R' : ''}
           </span>
          </div>
         );
        })}
       </div>
      </div>

      {/* Step Controls & Summary */}
      {steps.length > 0 && activeStep && (
       <div className="bg-muted/50 p-3 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
         <span className="text-sm font-medium">
          Step {currentStepIndex + 1} of {steps.length}
         </span>
         <div className="space-x-2">
          <Button
           size="sm"
           variant="outline"
           disabled={currentStepIndex === 0}
           onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
          >
           Previous
          </Button>
          <Button
           size="sm"
           variant="outline"
           disabled={currentStepIndex === steps.length - 1}
           onClick={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
          >
           Next
          </Button>
         </div>
        </div>
        <p className="text-sm text-muted-foreground">
         Sum of positions [{activeStep.left}, {activeStep.right}]:{' '}
         <strong className="text-foreground">{parsedNums[activeStep.left]} + {parsedNums[activeStep.right]} = {activeStep.sum}</strong>{' '}
         —{' '}
         {activeStep.result === 'found'
          ? 'Match found!'
          : activeStep.result === 'too-small'
           ? 'Too small, shifting left pointer forward.'
           : 'Too large, shifting right pointer backward.'}
        </p>
       </div>
      )}

      {foundPositions.length > 0 ? (
       <p className="font-semibold text-lg text-green-600">
        Success: {parsedNums[foundPositions[0] - 1]} + {parsedNums[foundPositions[1] - 1]} = {target} at positions [{foundPositions.join(' : ')}]!
       </p>
      ) : (
       <p className="font-semibold text-lg text-red-500">
        No two values add up to {target}.
       </p>
      )}
     </div>
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
