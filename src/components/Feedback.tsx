'use client'

import { forwardRef, useState, useRef, useEffect } from 'react'
import { Transition } from '@headlessui/react'
import clsx from 'clsx'
import { usePostHog } from 'posthog-js/react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

function CheckIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="10" strokeWidth="0" />
      <path
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="m6.75 10.813 2.438 2.437c1.218-4.469 4.062-6.5 4.062-6.5"
      />
    </svg>
  )
}

function FeedbackButton(
  props: Omit<
    React.ComponentPropsWithoutRef<'button'>,
    'type' | 'className'
  > & {
    response: 'clear' | 'feedback' | 'confusing'
    position?: 'left' | 'middle' | 'right'
  },
) {
  const { position, ...buttonProps } = props
  
  const roundedClasses = {
    left: 'rounded-l-full',
    middle: '',
    right: 'rounded-r-full'
  }

  return (
    <button
      type="button"
      className={clsx(
        "flex flex-1 items-center justify-center px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-900/2.5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white md:py-1.5",
        position && roundedClasses[position]
      )}
      {...buttonProps}
    />
  )
}

// Define the initial feedback form schema
const initialFeedbackSchema = z.object({
  response: z.enum(['clear', 'feedback', 'confusing']),
})

type InitialFeedbackFormValues = z.infer<typeof initialFeedbackSchema>

// Simple feedback form (Yes/No)
const FeedbackForm = forwardRef<
  React.ElementRef<typeof Form>,
  {
    onSubmit: (data: InitialFeedbackFormValues) => void
    className?: string
  }
>(function FeedbackForm({ onSubmit, className, ...props }, ref) {
  const form = useForm<InitialFeedbackFormValues>({
    resolver: zodResolver(initialFeedbackSchema),
    defaultValues: {
      response: undefined,
    },
  })

  const handleClearClick = () => {
    form.setValue('response', 'clear')
    form.handleSubmit(onSubmit)()
  }

  const handleFeedbackClick = () => {
    form.setValue('response', 'feedback')
    form.handleSubmit(onSubmit)()
  }

  const handleConfusingClick = () => {
    form.setValue('response', 'confusing')
    form.handleSubmit(onSubmit)()
  }

  return (
    <Form {...form}>
      <form
        ref={ref as any}
        className={clsx(
          className,
          'absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 md:flex-row md:justify-start md:gap-6 md:px-0',
        )}
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          How was this explanation for you?
        </p>
        <div className="group flex h-12 w-full max-w-2xl rounded-full border border-zinc-900/10 dark:border-white/10 md:h-10 md:w-auto">
          <FeedbackButton response="clear" position="left" onClick={handleClearClick}>
            🎯 Clear & Complete
          </FeedbackButton>
          <div className="w-px bg-zinc-900/10 dark:bg-white/10" />
          <FeedbackButton response="feedback" position="middle" onClick={handleFeedbackClick}>
            💬 Have Feedback
          </FeedbackButton>
          <div className="w-px bg-zinc-900/10 dark:bg-white/10" />
          <FeedbackButton response="confusing" position="right" onClick={handleConfusingClick}>
            😕 Hard to Follow
          </FeedbackButton>
        </div>
      </form>
    </Form>
  )
})

const FeedbackThanks = forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(function FeedbackThanks({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      className={clsx(
        className,
        'absolute inset-0 flex justify-center md:justify-start',
      )}
    >
      <div className="flex items-center gap-3 rounded-full bg-emerald-50/50 py-1 pl-1.5 pr-3 text-sm text-emerald-900 ring-1 ring-inset ring-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-200 dark:ring-emerald-500/30">
        <CheckIcon className="h-5 w-5 flex-none fill-emerald-500 stroke-white dark:fill-emerald-200/20 dark:stroke-emerald-200" />
        Thanks for your feedback!
      </div>
    </div>
  )
})

const detailedFeedbackSchema = z.object({
  category: z.string().optional(),
  details: z.string().min(0),
  email: z
    .string()
    .email({ message: 'Please enter a valid email' })
    .optional()
    .or(z.literal('')),
})

type DetailedFeedbackFormValues = z.infer<typeof detailedFeedbackSchema>

// Add onSkip prop to the FeedbackDetails component
interface FeedbackDetailsProps {
  onSubmit: (data: DetailedFeedbackFormValues) => void
  onSkip: () => void
  initialResponse: 'feedback' | 'confusing' | null
  className?: string
}

const FeedbackDetails = forwardRef<
  React.ElementRef<typeof Form>,
  FeedbackDetailsProps
>(function FeedbackDetails({ onSubmit, onSkip, initialResponse, className, ...props }, ref) {
  const form = useForm<DetailedFeedbackFormValues>({
    resolver: zodResolver(detailedFeedbackSchema),
    defaultValues: {
      category: '',
      details: '',
      email: '',
    },
  })

  const formRef = useRef<HTMLDivElement>(null)
  const isSelectOpenRef = useRef(false)

  useEffect(() => {
    // Function to handle clicks outside the form
    const handleClickOutside = (event: MouseEvent) => {
      if (isSelectOpenRef.current) {
        isSelectOpenRef.current = false
        return
      }

      const target = event.target as Element

      // Skip if clicking on elements inside the form
      if (formRef.current && !formRef.current.contains(target as Node)) {
        onSkip()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isSubmitEnabled =
    !!form.watch('category') || form.watch('details').trim() !== ''

  return (
    <Form {...form}>
      <form
        ref={ref as any}
        onSubmit={form.handleSubmit(onSubmit)}
        className={clsx(
          className,
          'absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 pt-4 md:items-start md:px-0 md:pt-0',
        )}
      >
        <div
          ref={formRef}
          className="w-full max-w-md rounded-lg border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="mb-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {initialResponse === 'confusing' 
              ? 'What made this explanation hard to follow?' 
              : 'How can we improve this explanation?'}
          </h3>

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="mb-3">
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                    onOpenChange={(open) => {
                      if (open) isSelectOpenRef.current = open
                    }}
                  >
                    <SelectTrigger className="w-full rounded border border-zinc-900/10 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-zinc-800">
                      <SelectValue placeholder="Select a category (optional)" />
                    </SelectTrigger>
                    <SelectContent className="text-sm">
                      <SelectItem value="mathematical_accuracy">Mathematical Accuracy</SelectItem>
                      <SelectItem value="explanation_flow">Explanation Flow</SelectItem>
                      <SelectItem value="examples_visualizations">Examples & Visualizations</SelectItem>
                      <SelectItem value="missing_concepts">Missing Concepts</SelectItem>
                      <SelectItem value="difficulty_level">Difficulty Level</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem className="mb-3">
                <FormControl>
                                      <Textarea
                      placeholder={initialResponse === 'confusing' 
                        ? 'What specific parts were confusing or unclear?'
                        : 'Please share what you found unclear or missing...'}
                      className="w-full rounded border border-zinc-900/10 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-zinc-800"
                      rows={3}
                      {...field}
                    />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="mb-3">
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Your email (optional)"
                    className="w-full rounded border border-zinc-900/10 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-zinc-800"
                    {...field}
                  />
                </FormControl>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Providing your email allows us to follow up on your feedback.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Skip
            </Button>
            <button
              type="submit"
              disabled={!isSubmitEnabled}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:cursor-not-allowed enabled:bg-sky-500 enabled:hover:bg-sky-600 disabled:bg-sky-300 disabled:hover:bg-sky-300"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </Form>
  )
})

export function Feedback() {
  let [submitted, setSubmitted] = useState(false)
  let [showDetailsInput, setShowDetailsInput] = useState(false)
  let [initialResponse, setInitialResponse] = useState<'feedback' | 'confusing' | null>(null)
  const posthog = usePostHog()
  const detailsFormRef = useRef<HTMLFormElement>(null)

  function handleInitialResponse(data: InitialFeedbackFormValues) {
    const responseValue = data.response

    if (responseValue === 'clear') {
      if (posthog) {
        posthog.capture('feedback submitted', {
          response: 'clear',
          page: window.location.pathname,
        })
      }

      setSubmitted(true)
    } else if (responseValue === 'feedback' || responseValue === 'confusing') {
      setInitialResponse(responseValue)
      setShowDetailsInput(true)
    }
  }

  function handleSkip() {
    const feedbackData: Record<string, any> = {
      response: initialResponse,
      page: window.location.pathname,
      'skipped details': true,
    }

    if (posthog) {
      posthog.capture('feedback submitted', feedbackData)
    }

    setSubmitted(true)
  }

  function handleDetailedFeedback(data: DetailedFeedbackFormValues) {
    const feedbackData: Record<string, any> = {
      response: initialResponse,
      page: window.location.pathname,
      'skipped details': false,
      category: 'not specified',
      details: 'none provided',
    }

    if (data.category) feedbackData.category = data.category
    if (data.details) feedbackData.details = data.details

    if (posthog) {
      // Identify the user if email is provided
      if (data.email) {
        posthog.identify(data.email)
        feedbackData.email = data.email
      }

      posthog.capture('feedback submitted', feedbackData)
    }

    setSubmitted(true)
  }

  return (
    <div className="relative h-16 md:h-12">
      <Transition
        show={!submitted && !showDetailsInput}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <FeedbackForm
          className="duration-300 data-[leave]:pointer-events-none data-[closed]:opacity-0"
          onSubmit={handleInitialResponse}
        />
      </Transition>

      <Transition
        show={!submitted && showDetailsInput}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <FeedbackDetails
          ref={detailsFormRef as any}
          className="z-10 duration-300 data-[leave]:pointer-events-none data-[closed]:opacity-0"
          onSubmit={handleDetailedFeedback}
          onSkip={handleSkip}
          initialResponse={initialResponse}
        />
      </Transition>

      <Transition
        show={submitted}
        enter="transition ease-out duration-200 delay-100"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <FeedbackThanks className="duration-300 data-[closed]:opacity-0" />
      </Transition>
    </div>
  )
}