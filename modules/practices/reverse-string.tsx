"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';


export default function ReverseStringFormatter() {
 const [str, setStr] = useState("")
 const [reversed, setReversed] = useState<string | null>(null)
 const handleChangeStr = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e?.target?.value
  setStr(value)
 }

 const isDisabled = !str

 const split = () => {
  let stack = []
  for (const element of str) {
   stack.push(element)
  }
  return stack
 }

 const handleReverseString = () => {
  if (isDisabled) return
  const stack = split()
  let reversedStr = ''
  while (stack.length > 0) {
   reversedStr += stack.pop()
  }

  setReversed(reversedStr)

 }
 return (
  <Card>
   <CardHeader>
    <CardTitle>Rerverse String</CardTitle>
    <CardDescription>
     Given a string {str}, reverse it and return the reversed string.
    </CardDescription>
   </CardHeader>
   <CardContent>
    <FieldGroup>
     <FieldSet>
      <FieldLabel>Enter String</FieldLabel>
      <Input value={str} onChange={handleChangeStr} />
     </FieldSet>
    </FieldGroup>

    {reversed && <p className="mt-4 font-semibold text-xl bg-radial from-blue-700 to-blue-400 bg-clip-text text-transparent">
     {reversed}
    </p>}
   </CardContent>
   <CardFooter className='justify-end'>
    <Button disabled={isDisabled} type='button' onClick={handleReverseString}>
     Reverse Value
    </Button>
   </CardFooter>
  </Card>
 );
}