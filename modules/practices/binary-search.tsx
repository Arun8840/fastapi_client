"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';

type Step = {
 mid: number;
 value: number;
 low: number;
 high: number;
 result: 'found' | 'too-small' | 'too-large';
}

export default function BinarySearchVisualizer() {
 const [numsStr, setNumsStr] = useState("2, 5, 8, 12, 16, 23, 38, 56, 72, 91")
 const [targetStr, setTargetStr] = useState("23")
 const [parsedNums, setParsedNums] = useState<number[]>([2, 5, 8, 12, 16, 23, 38, 56, 72, 91])
 const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
 const [steps, setSteps] = useState<Step[]>([])
 const [foundIndex, setFoundIndex] = useState<number | null>(null)
 const [hasSearched, setHasSearched] = useState(false)

 const isDisabled = !numsStr || !targetStr

 const handleSearch = () => {
  if (isDisabled) return

  const values = numsStr
   .split(/[\s,]+/)
   .filter(Boolean)
   .map(Number)
   .filter((n) => !Number.isNaN(n))
   .sort((a, b) => a - b)

  setParsedNums(values)

  let low = 0
  let high = values.length - 1
  const computedSteps: Step[] = []
  let target = Number(targetStr)
  let targetIdx = -1

  while (low <= high) {
   const mid = Math.floor((low + high) / 2)
   debugger
   const value = values[mid]
   debugger
   if (value === target) {
    debugger
    computedSteps.push({ mid, value, low, high, result: 'found' })
    debugger
    targetIdx = mid
    debugger
    break
   }

   if (value < target) {
    debugger
    computedSteps.push({ mid, value, low, high, result: 'too-small' })
    low = mid + 1
    debugger
   } else {
    debugger
    computedSteps.push({ mid, value, low, high, result: 'too-large' })
    high = mid - 1
    debugger
   }
  }

  setSteps(computedSteps)
  setFoundIndex(targetIdx)
  setCurrentStepIndex(0)
  setHasSearched(true)
 }

 const activeStep = steps[currentStepIndex]

 return (
  <Card>
   <CardHeader>
    <CardTitle>Binary Search Visualizer</CardTitle>
    <CardDescription className='space-y-2'>
     <p> Watch how the low, high, and mid pointers halve the search space step-by-step.</p>
     <p className='text-white bg-primary/40 p-2 rounded-lg border border-primary'>
      Binary search only works on <span className='font-semibold text-yellow-300'>sorted</span> arrays.
     </p>
    </CardDescription>
   </CardHeader>
   <CardContent className="space-y-4">
    <FieldGroup>
     <FieldSet>
      <FieldLabel>Sorted Values</FieldLabel>
      <Input value={numsStr} onChange={(e) => setNumsStr(e.target.value)} placeholder='e.g. 2, 5, 8, 12, 16, 23' />
     </FieldSet>
     <FieldSet>
      <FieldLabel>Target Number</FieldLabel>
      <Input value={targetStr} onChange={(e) => setTargetStr(e.target.value)} type='number' />
     </FieldSet>
    </FieldGroup>

    {hasSearched && parsedNums.length > 0 && (
     <div className="space-y-4 pt-2 border-t">
      {/* Visual Array Grid */}
      <div>
       <p className="text-xs font-medium text-muted-foreground mb-2">Array & Pointer Positions:</p>
       <div className="flex flex-wrap gap-1.5">
        {parsedNums.map((num, idx) => {
         const isLow = activeStep && idx === activeStep.low;
         const isHigh = activeStep && idx === activeStep.high;
         const isMid = activeStep && idx === activeStep.mid;
         const isInRange = activeStep && idx >= activeStep.low && idx <= activeStep.high;

         return (
          <div
           key={idx}
           className={`flex flex-col items-center justify-center w-12 h-14 rounded border text-sm font-semibold transition-all ${isMid
            ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/40'
            : isInRange
             ? 'bg-secondary text-secondary-foreground border-border'
             : 'bg-muted/40 text-muted-foreground border-transparent opacity-40'
            }`}
          >
           <span>{num}</span>
           <span className="text-[10px] font-normal mt-0.5">
            {isMid && 'MID'}
            {isLow && !isMid && 'L'}
            {isHigh && !isMid && 'H'}
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
         Checked index <strong className="text-foreground">{activeStep.mid}</strong> (value{' '}
         <strong className="text-foreground">{activeStep.value}</strong>) in range [{activeStep.low}, {activeStep.high}] —{' '}
         {activeStep.result === 'found'
          ? 'Match found!'
          : activeStep.result === 'too-small'
           ? 'Too small, shifting low pointer right.'
           : 'Too large, shifting high pointer left.'}
        </p>
       </div>
      )}

      {foundIndex !== null && foundIndex >= 0 ? (
       <p className="font-semibold text-lg text-green-600">
        Success: Target {targetStr} found at index {foundIndex}!
       </p>
      ) : (
       <p className="font-semibold text-lg text-red-500">
        Target {targetStr} is not present in the array.
       </p>
      )}
     </div>
    )}
   </CardContent>
   <CardFooter className='justify-end'>
    <Button disabled={isDisabled} type='button' onClick={handleSearch}>
     Run Binary Search
    </Button>
   </CardFooter>
  </Card>
 );
}