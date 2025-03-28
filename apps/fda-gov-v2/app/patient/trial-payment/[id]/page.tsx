"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, Lock, Shield, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface TrialPaymentParams {
  params: {
    id: string
  }
}

export default function TrialPayment({ params }: TrialPaymentParams) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")

  const trialId = params.id

  // Mock trial data
  const trial = {
    id: trialId,
    name: "Efficacy of Treatment A for Rheumatoid Arthritis",
    sponsor: "Innovative Therapeutics Inc.",
    phase: "Phase 2",
    status: "Recruiting",
    paymentDetails: {
      enrollmentFee: 199,
      refundableDeposit: 100,
      totalDue: 299,
      refundPolicy: "Full refund available within 14 days of enrollment if you decide to withdraw.",
    },
  }

  const validateForm = () => {
    const errors = {
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    }

    let isValid = true

    const cardNumberInput = document.getElementById("card-number") as HTMLInputElement
    if (!cardNumberInput?.value || cardNumberInput.value.replace(/\s/g, "").length !== 16) {
      errors.cardNumber = "Please enter a valid 16-digit card number"
      isValid = false
    }

    const cardNameInput = document.getElementById("cardName") as HTMLInputElement
    if (!cardNameInput?.value) {
      errors.cardName = "Please enter the name on card"
      isValid = false
    }

    const expiryDateInput = document.getElementById("expiry") as HTMLInputElement
    if (!expiryDateInput?.value || !/^\d{2}\/\d{2}$/.test(expiryDateInput.value)) {
      errors.expiryDate = "Please enter a valid expiry date (MM/YY)"
      isValid = false
    }

    const cvvInput = document.getElementById("cvv") as HTMLInputElement
    if (!cvvInput?.value || !/^\d{3,4}$/.test(cvvInput.value)) {
      errors.cvv = "Please enter a valid CVV"
      isValid = false
    }

    return isValid
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setPaymentComplete(true)
    }, 2000)
  }

  const handleCardNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    const formattedValue = value.replace(/(\d{4})/g, "$1 ").trim()
    setCardNumber(formattedValue)
  }

  const handleExpiryDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 4) {
      const formattedValue = value.replace(/(\d{2})(\d{0,2})/, "$1/$2").trim()
      setExpiryDate(formattedValue)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-6 md:py-10">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex items-center gap-2">
              <Link href={`/patient/trial-details/${trialId}`} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to trial details</span>
              </Link>
              <h1 className="text-2xl font-bold">Trial Enrollment Payment</h1>
            </div>

            {!paymentComplete ? (
              <div className="grid gap-6 md:grid-cols-5">
                <div className="md:col-span-3 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Details</CardTitle>
                      <CardDescription>Enter your payment information securely</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <form onSubmit={handleSubmit}>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="card-number">Card Number</Label>
                              <Input
                                id="card-number"
                                placeholder="0000 0000 0000 0000"
                                value={cardNumber}
                                onChange={handleCardNumberInput}
                                required
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="expiry">Expiry Date</Label>
                                <Input
                                  id="expiry"
                                  placeholder="MM/YY"
                                  value={expiryDate}
                                  onChange={handleExpiryDateInput}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input id="cvv" placeholder="123" maxLength={3} required />
                              </div>
                            </div>
                            <div className="pt-4">
                              <Alert variant="default" className="border-primary/20 bg-primary/5">
                                <Lock className="h-4 w-4 text-primary" />
                                <AlertTitle>Secure Payment</AlertTitle>
                                <AlertDescription>
                                  Your payment information is encrypted and secure.
                                </AlertDescription>
                              </Alert>
                            </div>
                          </div>
                          <Button type="submit" className="mt-6 w-full" disabled={isProcessing}>
                            {isProcessing ? (
                              <>Processing...</>
                            ) : (
                              <>Pay ${trial.paymentDetails.totalDue}</>
                            )}
                          </Button>
                        </form>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-medium">{trial.name}</h3>
                        <p className="text-sm text-muted-foreground">Sponsored by {trial.sponsor}</p>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Enrollment Fee</span>
                          <span>${trial.paymentDetails.enrollmentFee}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <span>Refundable Deposit</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>This deposit is fully refundable upon trial completion</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <span>${trial.paymentDetails.refundableDeposit}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total Due Today</span>
                          <span>${trial.paymentDetails.totalDue}</span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted p-3 text-sm">
                        <p className="font-medium">Refund Policy</p>
                        <p className="text-muted-foreground mt-1">{trial.paymentDetails.refundPolicy}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-start gap-3 rounded-lg border p-4">
                    <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Secure & Protected</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your payment and personal information are protected with industry-standard encryption.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="rounded-full bg-green-100 p-3 mb-4">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Thank you for your payment. You have been successfully enrolled in the trial.
                    </p>

                    <div className="w-full max-w-md rounded-lg border p-4 mb-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Order ID:</span>
                          <span className="font-medium">
                            FDA-{Math.random().toString(36).substring(2, 10).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount Paid:</span>
                          <span className="font-medium">${trial.paymentDetails.totalDue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Method:</span>
                          <span className="font-medium">Credit Card (•••• 3456)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={() => router.push("/patient/dashboard")}>Go to Dashboard</Button>
                      <Button variant="outline">Download Receipt</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

