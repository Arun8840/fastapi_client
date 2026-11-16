"use client"


import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

export default function CharacterCounter() {

 const char = "arun prakash"

 const splitChar = (): string[] => {
  return char.split("")
 }

 const countChar = () => {
  let charObj: Record<string, number> = {}
  const splitedChar = splitChar()
  for (const element of splitedChar) {
   if (element === " ") continue

   charObj[element] = (charObj[element] ?? 0) + 1
  }

  return charObj
 }

 const result = countChar()

 return (
  <Card>
   <CardHeader>
    <CardTitle>
     Character Counter
    </CardTitle>
    <CardDescription>
     Questions for Character Counting
    </CardDescription>
    <div className='flex gap-2 pt-2'>
     <Badge variant='default' className='h-7 px-3 text-sm'>Time: O(n)</Badge>
     <Badge variant='default' className='h-7 px-3 text-sm'>Space: O(k)</Badge>
    </div>
   </CardHeader>
   <CardContent className='space-y-2'>
    <p>
     <span className='text-orange-400'>Problem</span> : Given a string, count how many times each character appears in it.</p>
    <p>
     <span className='text-sky-500'>Example</span> : char = "arun prakash"
    </p>

    <h1 className='text-emerald-500'>Explanation</h1>
    <p className='bg-lime-200 text-black font-medium  p-3 rounded-lg'>
     We split the string into individual characters and loop through them.
     For each character we use an object as a hash map to store the count.
     If the character already exists we add 1 to its count, otherwise we start it at 1.
     Spaces are skipped using the continue statement so they are not counted.
    </p>

    <p className='text-green-500'>Ans = {JSON.stringify(result)}</p>
   </CardContent>

   <CardFooter>
    <p className='font-medium'>
     This counting method uses the same hashmap idea as the two-sum problem. Instead of storing value and index, the hashmap stores the character itself as the key and how many times it appears as the value. This is the base for problems like anagrams, first unique character and frequency counting.
    </p>
   </CardFooter>
  </Card>
 );
}
