'use client'

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"

import { useTaskMutations } from "@/service/mutations";
import { getApiErrorMessage } from "@/service/controller/api-client";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDrawerState } from "@/hooks/use-drawer-state";
import { CreateTaskInputType, CreateTaskSchema } from "./schema.task";

const toastHandler = (type: "success" | "error", message: string) => {
 toast.add({ type, description: message })
}

const TASK_STATUSES = [
 { value: "pending", label: "Pending" },
 { value: "in_progress", label: "In Progress" },
 { value: "completed", label: "Completed" },
 { value: "cancelled", label: "Cancelled" },
] as const

interface CreateTaskProps {
 newOrder?: number
}

export default function CreateTask({ newOrder }: CreateTaskProps) {
 const { close } = useDrawerState({ value: "create-task" })
 const { create } = useTaskMutations()
 const [calendarOpen, setCalendarOpen] = useState(false)
 const isPending = create.isPending

 const form = useForm<CreateTaskInputType>({
  defaultValues: {
   title: "",
   description: "",
   status: "pending",
   due_date: undefined,
  },
  resolver: zodResolver(CreateTaskSchema)
 })

 const handleCreate = (data: CreateTaskInputType) => {
  create.mutate({ ...data, order: newOrder }, {
   onSuccess(data) {
    toastHandler("success", data?.message || "Task created successfully")
    form.reset()
    close()
   },
   onError(error) {
    toastHandler("error", getApiErrorMessage(error))
   },
  })
 }

 return (
  <form className="w-full px-4" onSubmit={form.handleSubmit(handleCreate)}>
   <FieldSet>
    <Controller
     control={form.control}
     name="title"
     render={({ field }) => {
      const error = form.formState.errors.title
      return (
       <Field>
        <FieldLabel>Title</FieldLabel>
        <FieldContent>
         <Input
          {...field}
          placeholder="Enter task title"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'title-error' : undefined}
         />
        </FieldContent>
        {error && (
         <FieldError id='title-error' errors={[error]} className='text-[#B42318]' />
        )}
       </Field>
      )
     }}
    />

    <Controller
     control={form.control}
     name="description"
     render={({ field }) => {
      const error = form.formState.errors.description
      return (
       <Field>
        <FieldLabel>Description</FieldLabel>
        <FieldContent>
         <Textarea
          {...field}
          placeholder="Enter task description (optional)"
          rows={3}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'description-error' : undefined}
         />
        </FieldContent>
        {error && (
         <FieldError id='description-error' errors={[error]} className='text-[#B42318]' />
        )}
       </Field>
      )
     }}
    />

    <Controller
     control={form.control}
     name="status"
     render={({ field }) => {
      const error = form.formState.errors.status
      return (
       <Field>
        <FieldLabel>Status</FieldLabel>
        <FieldContent>
         <Select
          items={TASK_STATUSES}
          value={field.value}
          onValueChange={(value) => field.onChange(value)}
         >
          <SelectTrigger
           className='w-full'
           aria-invalid={Boolean(error)}
           aria-describedby={error ? 'status-error' : undefined}
          >
           <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
           {TASK_STATUSES.map((status) => (
            <SelectItem key={status.value} value={status.value}>
             {status.label}
            </SelectItem>
           ))}
          </SelectContent>
         </Select>
        </FieldContent>
        {error && (
         <FieldError id='status-error' errors={[error]} className='text-[#B42318]' />
        )}
       </Field>
      )
     }}
    />

    <Controller
     control={form.control}
     name="due_date"
     render={({ field }) => {
      const error = form.formState.errors.due_date
      const selectedDate = field.value ? new Date(field.value) : undefined
      return (
       <Field>
        <FieldLabel>Due Date (Optional)</FieldLabel>
        <FieldContent>
         <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger
           render={
            <Button
             type="button"
             variant="outline"
             className="w-full justify-start font-normal"
             aria-invalid={Boolean(error)}
             aria-describedby={error ? 'due_date-error' : undefined}
            >
             <CalendarIcon className="size-4 text-muted-foreground" />
             {selectedDate ? format(selectedDate, "PPP") : "Pick a due date"}
            </Button>
           }
          />
          <PopoverContent className="w-auto p-0" align="start">
           <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
             field.onChange(date ? date.toISOString() : undefined)
             setCalendarOpen(false)
            }}
           />
          </PopoverContent>
         </Popover>
        </FieldContent>
        {error && (
         <FieldError id='due_date-error' errors={[error]} className='text-[#B42318]' />
        )}
       </Field>
      )
     }}
    />
   </FieldSet>

   <div className="mt-6 flex justify-end gap-2">
    <Button
     type="button"
     variant="secondary"
     size="lg"
     onClick={close}
     disabled={isPending}
    >
     Cancel
    </Button>
    <Button
     type="submit"
     size="lg"
     disabled={isPending}
    >
     {isPending ? (
      <>
       <Spinner /> Creating...
      </>
     ) : (
      "Create Task"
     )}
    </Button>
   </div>
  </form>
 )
}