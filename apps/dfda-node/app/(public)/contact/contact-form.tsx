"use client"

import type React from "react"
import type { Database } from "@/lib/database.types"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from '@/utils/supabase/client'
import { Check } from "lucide-react"
import { logger } from "@/lib/logger"

type ContactMessage = Database["public"]["Tables"]["contact_messages"]["Insert"]

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)

    const formData = new FormData(e.currentTarget)
    const message: ContactMessage = {
      email: formData.get("email") as string,
      subject: formData.get("inquiryType") as string,
      message: formData.get("message") as string,
      name: "Anonymous", // Default name for now
      status: "new",
    }

    try {
      const { error } = await supabase.from("contact_messages").insert(message)

      if (error) throw error

      setIsSubmitted(true)
      e.currentTarget.reset()
    } catch (error) {
      logger.error("Error submitting contact form:", error)
      setFormError("There was an error submitting your message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Message Sent Successfully</h3>
        <p className="text-muted-foreground mb-6">
          Thank you for reaching out! We&apos;ve received your message and will get back to you as soon as possible.
        </p>
        <Button onClick={() => setIsSubmitted(false)}>Send Another Message</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inquiryType">Inquiry Type</Label>
        <Select name="inquiryType" required defaultValue="general">
          <SelectTrigger>
            <SelectValue placeholder="Select inquiry type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Inquiry</SelectItem>
            <SelectItem value="support">Technical Support</SelectItem>
            <SelectItem value="partnership">Partnership Opportunity</SelectItem>
            <SelectItem value="media">Media Inquiry</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" placeholder="How can we help you?" className="min-h-[150px]" required />
      </div>

      {formError && <div className="text-red-500 text-sm">{formError}</div>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
