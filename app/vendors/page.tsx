"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/Components/ui/card"
import { Button } from "@/app/Components/ui/button"
import { Input } from "@/app/Components/ui/input"
import { Label } from "@/app/Components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/app/Components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/Components/ui/select"
import { PlusCircleIcon, PhoneIcon, MailIcon, MapPinIcon, EditIcon, Trash2Icon, UsersIcon } from "lucide-react"
import { useRouter } from "next/navigation"

type Vendor = {
  id: string
  name: string
  service: string
  contact_person: string
  phone: string
  email: string
  status: "Booked" | "Pending" | "Contacted" | "Researching"
  user_id?: string
  created_at?: string
  updated_at?: string
}

export default function WeddingVendors() {
  const supabase = createClient()
  const router = useRouter()

  const [userId, setUserId] = useState<string | null>(null)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchVendors = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        console.error("User not found:", userError?.message)
        router.push("/login")
        return
      }

      const user_id = userData.user.id
      setUserId(user_id)

      const { data: items, error: itemsError } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", user_id)
        .order('created_at', { ascending: false })

      if (itemsError) {
        console.error("Error fetching vendors:", itemsError.message)
      } else {
        setVendors(items || [])
      }

      setLoading(false)
    }

    fetchVendors()
  }, [supabase, router])

  const handleSaveVendor = async (event: React.FormEvent) => {
    event.preventDefault()
    console.log('Save vendor called')
    console.log('Current vendor data:', currentVendor)
    
    if (!currentVendor || !userId) {
      console.error('No current vendor data or user ID')
      return
    }

    try {
      setSaving(true)

      if (!currentVendor.id || currentVendor.id === "") {
        // Add new vendor
        console.log('Adding new vendor...')
        const vendorData = {
          user_id: userId,
          name: currentVendor.name,
          service: currentVendor.service,
          contact_person: currentVendor.contact_person || null,
          phone: currentVendor.phone || null,
          email: currentVendor.email || null,
          status: currentVendor.status
        }
        
        console.log('Vendor data to insert:', vendorData)
        
        const { data, error } = await supabase
          .from('vendors')
          .insert([vendorData])
          .select()
          .single()

        console.log('Insert response:', { data, error })

        if (error) {
          console.error('Error adding vendor:', error.message)
          return
        }

        if (data) {
          setVendors(prev => [data, ...prev])
          console.log('Vendor added successfully!')
        }
      } else {
        // Update existing vendor
        console.log('Updating existing vendor...')
        const updateData = {
          name: currentVendor.name,
          service: currentVendor.service,
          contact_person: currentVendor.contact_person || null,
          phone: currentVendor.phone || null,
          email: currentVendor.email || null,
          status: currentVendor.status
        }
        
        console.log('Update data:', updateData)
        
        const { data, error } = await supabase
          .from('vendors')
          .update(updateData)
          .eq('id', currentVendor.id)
          .eq('user_id', userId)
          .select()
          .single()

        console.log('Update response:', { data, error })

        if (error) {
          console.error('Error updating vendor:', error.message)
          return
        }

        if (data) {
          setVendors(prev => prev.map(v => v.id === currentVendor.id ? data : v))
          console.log('Vendor updated successfully!')
        }
      }

      setIsDialogOpen(false)
      setCurrentVendor(null)
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteVendor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return

    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting vendor:', error.message)
    } else {
      setVendors(prev => prev.filter(v => v.id !== id))
      console.log('Vendor deleted successfully!')
    }
  }

  const openAddDialog = () => {
    setCurrentVendor({
      id: "",
      name: "",
      service: "",
      contact_person: "",
      phone: "",
      email: "",
      status: "Researching",
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (vendor: Vendor) => {
    setCurrentVendor(vendor)
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500 animate-pulse">
        Loading your vendor details...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-blue-400 mb-6 text-center">Wedding Vendors</h2>

      <Card className="p-6 bg-white shadow-lg border-blue-300 border-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl text-cyan-300">Your Vendor List</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openAddDialog}
                className="bg-red-300 hover:bg-gradient-to-br from-pink-400 to-blue-400 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white backdrop-blur-sm bg-opacity-90 shadow-xl rounded-lg border-blue-400">
              <DialogHeader>
                <DialogTitle className="text-blue-400 text-lg font-semibold">
                  {currentVendor?.id ? "Edit Vendor" : "Add New Vendor"}
                </DialogTitle>
                <CardDescription className="text-black text-sm">
                  {currentVendor?.id ? "Make changes to vendor details." : "Fill in the details for your new vendor."}
                </CardDescription>
              </DialogHeader>
              <form onSubmit={handleSaveVendor} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4 text-blue-50">
                  <p className="text-sm text-black">Company name</p>
                  <Input
                    id="name"
                    placeholder="Enter Vendor Name"
                    value={currentVendor?.name || ""}
                    onChange={(e) => setCurrentVendor((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                    className="col-span-3 border-pink-400/50 focus:border-pink-400 focus:ring-purple-500 animate-pulse"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4 text-blue-50">
                  <p className="text-sm text-black">Service</p>
                  <Input
                    id="service"
                    placeholder="e.g., Venue, Catering"
                    value={currentVendor?.service || ""}
                    onChange={(e) => setCurrentVendor((prev) => (prev ? { ...prev, service: e.target.value } : null))}
                    className="col-span-3 border-pink-400/50 focus:border-pink-400 focus:ring-purple-500 animate-pulse"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4 text-blue-50">
                  <p className="text-sm text-black">Contact Person</p>
                  <Input
                    id="contactPerson"
                    placeholder="e.g., Takunda Themu"
                    value={currentVendor?.contact_person || ""}
                    onChange={(e) =>
                      setCurrentVendor((prev) => (prev ? { ...prev, contact_person: e.target.value } : null))
                    }
                    className="col-span-3 border-pink-400/50 focus:border-pink-400 focus:ring-purple-500 animate-pulse"
                    disabled={saving}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4 text-blue-50">
                  <p className="text-sm text-black">Phone number</p>
                  <Input
                    id="phone"
                    placeholder="e.g., 077-123-4567"
                    value={currentVendor?.phone || ""}
                    onChange={(e) => setCurrentVendor((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
                    className="col-span-3 border-pink-400/50 focus:border-pink-400 focus:ring-purple-500 animate-pulse"
                    type="tel"
                    disabled={saving}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4 text-blue-50">
                  <p className="text-sm text-black">Email</p>
                  <Input
                    id="email"
                    placeholder="e.g., vendor@example.com"
                    value={currentVendor?.email || ""}
                    onChange={(e) => setCurrentVendor((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                    className="col-span-3 border-pink-400/50 focus:border-pink-400 focus:ring-purple-500 animate-pulse"
                    type="email"
                    disabled={saving}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right text-black">
                    Status
                  </Label>
                  <Select
                    value={currentVendor?.status || "Researching"}
                    onValueChange={(value: Vendor["status"]) =>
                      setCurrentVendor((prev) => (prev ? { ...prev, status: value } : null))
                    }
                    disabled={saving}
                  >
                    <SelectTrigger className="col-span-3 border-pink-400/50 focus:border-pink-400 focus:ring-purple-500 ">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-blue-300 shadow-lg rounded-md border-pink-400/50 hover:bg-gradient-to-br from-pink-400 to-blue-400">
                      <SelectItem value="Booked">Booked</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Researching" className="text-emerald-500">Researching</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-cyan-300 hover:bg-purple-400 text-white shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">No vendors added yet. Click "Add Vendor" to get started!</p>
            </div>
          ) : (
            vendors.map((vendor) => (
              <Card
                key={vendor.id}
                className="p-4 bg-blue-200 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]"></div>
                <div className="relative z-10">
                  <CardTitle className="text-xl mb-2">{vendor.name}</CardTitle>
                  <CardDescription className="text-gray-700 mb-3">{vendor.service}</CardDescription>
                  <div className="space-y-1 text-sm text-gray-600">
                    {vendor.contact_person && (
                      <p className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4" /> {vendor.contact_person}
                      </p>
                    )}
                    {vendor.phone && (
                      <p className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4" /> {vendor.phone}
                      </p>
                    )}
                    {vendor.email && (
                      <p className="flex items-center gap-2">
                        <MailIcon className="h-4 w-4" /> {vendor.email}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4" /> Status:{" "}
                      <span
                        className={`font-semibold ${vendor.status === "Booked"
                            ? "text-green-600"
                            : vendor.status === "Pending"
                              ? "text-yellow-600"
                              : vendor.status === "Contacted"
                                ? "text-blue-600"
                                : "text-gray-600"
                          }`}
                      >
                        {vendor.status}
                      </span>
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(vendor)}
                      className="text-gray-500 hover:text-cyan-400"
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteVendor(vendor.id)}
                      className="text-gray-500 hover:text-red-400 hover:animate-bounce transition-all duration-300"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
