"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/Components/ui/card"
import { Button } from "@/app/Components/ui/button"
import { Input } from "@/app/Components/ui/input"
import { Label } from "@/app/Components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/app/Components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/Components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/Components/ui/table"
import { UserPlusIcon, Trash2Icon, EditIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type Guest = {
  id?: string
  user_id?: string
  name: string
  email: string
  rsvp_status: "Attending" | "Declined" | "Pending"
  plus_one: boolean
  meal_choice: string
  created_at?: string
  updated_at?: string
}

export default function WeddingGuests() {
  const supabase = createClient()
  const router = useRouter()

  const [guests, setGuests] = useState<Guest[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("All")
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Check authentication and fetch guests on component mount
  useEffect(() => {
    const fetchGuests = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        console.error("User not found:", userError?.message)
        router.push("/login")
        return
      }

      const user_id = userData.user.id
      setUserId(user_id)

      const { data, error } = await supabase
        .from('wedding_guests')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching guests:', error.message)
      } else {
        setGuests(data || [])
      }

      setLoading(false)
    }

    fetchGuests()
  }, [supabase, router])

  const handleSaveGuest = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!currentGuest || !userId) return

    if (!currentGuest.id) {
      // Add new guest
      const guestData = {
        user_id: userId,
        name: currentGuest.name,
        email: currentGuest.email,
        rsvp_status: currentGuest.rsvp_status,
        plus_one: currentGuest.plus_one,
        meal_choice: currentGuest.meal_choice
      }

      const { data, error } = await supabase
        .from('wedding_guests')
        .insert([guestData])
        .select()

      if (error) {
        console.error('Error adding guest:', error.message)
      } else if (data && data[0]) {
        setGuests([data[0], ...guests])
      }
    } else {
      // Update existing guest
      const updateData = {
        name: currentGuest.name,
        email: currentGuest.email,
        rsvp_status: currentGuest.rsvp_status,
        plus_one: currentGuest.plus_one,
        meal_choice: currentGuest.meal_choice
      }

      const { data, error } = await supabase
        .from('wedding_guests')
        .update(updateData)
        .eq('id', currentGuest.id)
        .select()

      if (error) {
        console.error('Error updating guest:', error.message)
      } else if (data && data[0]) {
        setGuests(guests.map((g) => (g.id === currentGuest.id ? data[0] : g)))
      }
    }

    setIsDialogOpen(false)
    setCurrentGuest(null)
  }

  const handleDeleteGuest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return

    const { error } = await supabase
      .from('wedding_guests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting guest:', error.message)
    } else {
      setGuests(guests.filter((g) => g.id !== id))
    }
  }

  const openAddDialog = () => {
    setCurrentGuest({
      name: "",
      email: "",
      rsvp_status: "Pending",
      plus_one: false,
      meal_choice: "N/A",
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (guest: Guest) => {
    setCurrentGuest(guest)
    setIsDialogOpen(true)
  }

  const filteredGuests = guests.filter((guest) => {
    if (filterStatus === "All") return true
    return guest.rsvp_status === filterStatus
  })

  const attendingCount = guests.filter((g) => g.rsvp_status === "Attending").length
  const declinedCount = guests.filter((g) => g.rsvp_status === "Declined").length
  const pendingCount = guests.filter((g) => g.rsvp_status === "Pending").length

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500 animate-pulse">
        Loading your guest list...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-blue-400 mb-6 text-center">Wedding Guests</h2>

      <Card className="p-6 bg-white shadow-lg border-blue-300 border-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl text-cyan-300">Guest List Overview</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openAddDialog}
                className="bg-red-300 hover:bg-gradient-to-br from-pink-400 to-blue-400 backdrop-blur-[1px] text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                <UserPlusIcon className="mr-2 h-4 w-4" /> Add Guest
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white backdrop-blur-sm bg-opacity-90 shadow-xl rounded-lg border-blue-300 border-2">
              <DialogHeader>
                <DialogTitle className="text-blue-400 font-semibold">
                  {currentGuest?.id ? "Edit Guest" : "Add New Guest"}
                </DialogTitle>
                <CardDescription className="text-black">
                  {currentGuest?.id ? "Make changes to guest details." : "Fill in the details for your new guest."}
                </CardDescription>
              </DialogHeader>
              <form onSubmit={handleSaveGuest} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-black">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={currentGuest?.name || ""}
                    onChange={(e) => setCurrentGuest((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                    className="text-gray-400 col-span-3 border-pink-400 focus:border-pink-500 focus:ring-purple-500 animate-pulse"
                    required
                    placeholder="Enter Guest Name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right text-black">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={currentGuest?.email || ""}
                    onChange={(e) => setCurrentGuest((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                    className="text-gray-400 col-span-3 border-pink-400 focus:border-pink-500 focus:ring-purple-500 animate-pulse"
                    type="email"
                    placeholder="e.g., guest@example.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rsvpStatus" className="text-right text-black">
                    RSVP Status
                  </Label>
                  <Select
                    value={currentGuest?.rsvp_status || "Pending"}
                    onValueChange={(value: Guest["rsvp_status"]) =>
                      setCurrentGuest((prev) => (prev ? { ...prev, rsvp_status: value } : null))
                    }
                  >
                    <SelectTrigger className="text-gray-400 col-span-3 border-pink-400 focus:border-pink-500 focus:ring-purple-500 animate-pulse">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-blue-300 hover:bg-gradient-to-br from-pink-400 to-blue-400 shadow-lg rounded-md border-purple-400">
                      <SelectItem value="Attending">Attending</SelectItem>
                      <SelectItem value="Declined">Declined</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="plusOne" className="text-right text-black">
                    Plus One
                  </Label>
                  <Select
                    value={currentGuest?.plus_one ? "Yes" : "No"}
                    onValueChange={(value: string) =>
                      setCurrentGuest((prev) => (prev ? { ...prev, plus_one: value === "Yes" } : null))
                    }
                  >
                    <SelectTrigger className="text-gray-400 col-span-3 border-pink-400 focus:border-pink-500 focus:ring-purple-500 animate-pulse">
                      <SelectValue placeholder="Plus One?" />
                    </SelectTrigger>
                    <SelectContent className="bg-blue-300 hover:bg-gradient-to-br from-pink-400 to-blue-400 shadow-lg rounded-md border-wedding-light-blue/50">
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="mealChoice" className="text-right text-black">
                    Meal Choice
                  </Label>
                  <Input
                    id="mealChoice"
                    value={currentGuest?.meal_choice || ""}
                    onChange={(e) => setCurrentGuest((prev) => (prev ? { ...prev, meal_choice: e.target.value } : null))}
                    className="text-gray-400 col-span-3 border-pink-400 focus:border-pink-500 focus:ring-purple-500 animate-pulse"
                    placeholder="e.g., Chicken, Vegetarian"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-cyan-300 hover:bg-gradient-to-br from-pink-400 to-blue-400 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Save changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-pink-600/10 rounded-lg shadow-sm">
              <div className="text-lg text-gray-600">Total Guests</div>
              <div className="text-2xl font-bold">{guests.length}</div>
            </div>
            <div className="text-center p-3 bg-blue-400/10 rounded-lg shadow-sm">
              <div className="text-lg text-gray-600">Attending</div>
              <div className="text-2xl font-bold text-green-600">{attendingCount}</div>
            </div>
            <div className="text-center p-3 bg-purple-700/10 rounded-lg shadow-sm">
              <div className="text-lg text-gray-600">Pending/Declined</div>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount + declinedCount}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Label htmlFor="filterStatus" className="text-gray-700">
              Filter by Status:
            </Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] border-blue-300 focus:border-blue-500 focus:ring-purple-500 animate-pulse">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="bg-blue-300 hover:bg-gradient-to-br from-pink-400 to-blue-400 shadow-lg rounded-md border-blue-300">
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Attending">Attending</SelectItem>
                <SelectItem value="Declined">Declined</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {guests.length === 0 ? (
            <div className="text-center py-12">
              <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No guests yet</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first guest!</p>
              <Button
                onClick={openAddDialog}
                className="bg-purple-700/10 hover:bg-gradient-to-br from-pink-400 to-blue-400 text-white"
              >
                Add Your First Guest
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-300/10">
                  <TableHead className="text-cyan-300">Name</TableHead>
                  <TableHead className="text-cyan-300">Email</TableHead>
                  <TableHead className="text-cyan-300">RSVP Status</TableHead>
                  <TableHead className="text-cyan-300">Plus One</TableHead>
                  <TableHead className="text-cyan-300">Meal Choice</TableHead>
                  <TableHead className="text-cyan-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.map((guest) => (
                  <TableRow key={guest.id} className="hover:bg-gradient-to-br from-pink-400 to-blue-400 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-800">{guest.name}</TableCell>
                    <TableCell className="text-gray-700">{guest.email}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${guest.rsvp_status === "Attending"
                          ? "bg-green-100 text-green-400"
                          : guest.rsvp_status === "Declined"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-600"
                          }`}
                      >
                        {guest.rsvp_status}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-700">{guest.plus_one ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-gray-700">{guest.meal_choice}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(guest)}
                        className="text-gray-500 hover:text-cyan-300"
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteGuest(guest.id!)}
                        className="text-gray-500 hover:text-red-500 hover:animate-bounce"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
