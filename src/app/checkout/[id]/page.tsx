"use client"

import { useEffect, useState, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type Course = {
  id: string
  title: string
  price: number
  image: string
}

export default function CheckoutPage() {
  const { id } = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!id) return
    async function fetchCourse() {
      const res = await fetch(`/api/courses/${id}`)
      if (res.ok) {
        const data = await res.json()
        setCourse(data)
      }
    }
    fetchCourse()
  }, [id])

  const handleCheckout = () => {
    if (!course) return
    startTransition(async () => {
      try {
        const res = await fetch(`/api/payments/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: course.id }),
        })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url // Stripe checkout session
        }
      } catch (err) {
        console.error(err)
        alert("Checkout failed")
      }
    })
  }

  if (!course) return <p className="text-center py-20">Loading checkout...</p>

  return (
    <main className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <img src={course.image} alt={course.title} className="w-40 h-28 rounded shadow" />
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{course.title}</h2>
          <p className="text-gray-600">Price: ${course.price}</p>
          <Button
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleCheckout}
            disabled={isPending}
          >
            {isPending ? "Processing..." : "Proceed to Pay"}
          </Button>
        </div>
      </div>
    </main>
  )
}
