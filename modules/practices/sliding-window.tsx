"use client"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';

type Step = {
  start: number;
  end: number;
  sum: number;
}

export default function SlidingWindow() {
  const [numsStr, setNumsStr] = useState("2, 1, 5, 1, 3, 2")
  const [kStr, setKStr] = useState("3")
  const [result, setResult] = useState<{ maxSum: number; bestStart: number; steps: Step[] } | null>(null)

  const parsedNums = numsStr
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n))

  const k = Number(kStr)
  const isDisabled = !numsStr || !kStr || k <= 0 || k > parsedNums.length

  console.log(parsedNums)
  const maxSumOfWindow = (numbers: number[], size: number) => {
    let windowSum = 0
    debugger
    for (let i = 0;i < size;i++) {
      debugger
      windowSum += numbers[i]
      debugger
    }

    let maxSum = windowSum
    debugger
    let bestStart = 0
    debugger
    const steps: Step[] = [{ start: 0, end: size - 1, sum: windowSum }]

    debugger
    for (let i = size;i < numbers.length;i++) {
      debugger
      windowSum += numbers[i] - numbers[i - size]
      debugger

      if (windowSum > maxSum) {
        debugger
        maxSum = windowSum
        bestStart = i - size + 1
        debugger
      }

      steps.push({ start: i - size + 1, end: i, sum: windowSum })
      debugger
    }

    return { maxSum, bestStart, steps }
  }

  const findMaxSum = () => {
    if (isDisabled) return

    setResult(maxSumOfWindow(parsedNums, k))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Sliding Window
        </CardTitle>
        <CardDescription>
          Questions for Sliding Window
        </CardDescription>
        <div className='flex gap-2 pt-2'>
          <Badge variant='default' className='h-7 px-3 text-sm'>Time: O(n)</Badge>
          <Badge variant='default' className='h-7 px-3 text-sm'>Space: O(1)</Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-2'>
        <p>
          <span className='text-orange-400'>Problem</span> : Given an array of integers nums and an integer k, find the maximum sum of any contiguous subarray of size k.
        </p>
        <p>
          <span className='text-sky-500'>Example</span> : nums = [ 2, 1, 5, 1, 3, 2 ], k = 3 → Answer = 9
        </p>

        <h1 className='text-emerald-500'>Explanation</h1>
        <p className='bg-lime-200 text-black font-medium p-3 rounded-lg'>
          Instead of adding k numbers for every window, we keep a running sum of the current window.
          First we add the first k numbers. Then we slide the window one step to the right:
          we subtract the number that leaves the window and add the number that enters it.
          After each slide we compare the new sum with the best sum we have seen so far.
          Each element is added and removed at most once, so the whole array is scanned in O(n) time.
        </p>

        <p className='text-green-500'>
          Ans = {result ? result.maxSum : '—'}
        </p>

        <FieldGroup className='pt-2'>
          <FieldSet>
            <FieldLabel>Enter Values</FieldLabel>
            <Input value={numsStr} onChange={(e) => setNumsStr(e.target.value)} placeholder='example: 2, 1, 5, 1, 3, 2' />
          </FieldSet>
          <FieldSet>
            <FieldLabel>Window Size (k)</FieldLabel>
            <Input value={kStr} onChange={(e) => setKStr(e.target.value)} placeholder='example: 3' type='number' />
          </FieldSet>
        </FieldGroup>

        {result && (
          <div className='space-y-3 pt-2 border-t'>
            <div>
              <p className='text-xs font-medium text-muted-foreground mb-2'>Windows of size {k}:</p>
              <div className='flex flex-wrap gap-1.5'>
                {parsedNums.map((num, idx) => {
                  const inBest = idx >= result.bestStart && idx < result.bestStart + k
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col items-center justify-center w-12 h-14 rounded border text-sm font-semibold transition-all ${inBest
                        ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/40'
                        : 'bg-muted/40 text-muted-foreground border-border'
                        }`}
                    >
                      <span>{num}</span>
                      <span className='text-[10px] font-normal mt-0.5'>{inBest ? 'BEST' : idx}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className='bg-muted/50 p-3 rounded-lg space-y-1'>
              <p className='text-sm font-medium'>Window sums</p>
              {result.steps.map((step, idx) => (
                <p key={idx} className='text-sm text-muted-foreground'>
                  indices [{step.start} : {step.end}] → sum ={' '}
                  <strong className={step.sum === result.maxSum ? 'text-green-600' : 'text-foreground'}>{step.sum}</strong>
                </p>
              ))}
            </div>

            <p className='font-semibold text-lg'>
              Best window starts at index {result.bestStart} with sum {result.maxSum}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className='flex flex-col items-start gap-2'>
        <p className='font-medium'>
          Sliding window is a way to reuse work between overlapping ranges. Usually one pointer marks the start and another marks the end of the window, and the window grows or shrinks as needed. The same idea solves fixed-size windows (max sum of size k) and variable-size windows (longest substring without repeating characters).
        </p>
        <p className='bg-sky-200 text-black font-medium p-3 rounded-lg w-full'>
          <span className='text-emerald-600 font-semibold'>Advantage of Sliding Window</span> : It avoids recomputing the whole window (a naive solution is O(n·k)).
          By adding and removing one element per step it runs in O(n) time and needs only O(1) extra space.
        </p>
      </CardFooter>
      <CardFooter className='justify-end'>
        <Button disabled={isDisabled} type='button' onClick={findMaxSum}>
          Find ans
        </Button>
      </CardFooter>
    </Card>
  );
}
