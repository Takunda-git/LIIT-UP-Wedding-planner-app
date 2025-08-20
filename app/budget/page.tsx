"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/app/Components/ui/card";
import { Input } from "@/app/Components/ui/input";
import { Button } from "@/app/Components/ui/button";
import { Progress } from "@/app/Components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/app/Components/ui/table";
import { PlusCircleIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WeddingBudget() {
  const supabase = createClient();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [estimatedBudget, setEstimatedBudget] = useState<number>(0);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newAllocated, setNewAllocated] = useState("");

  useEffect(() => {
    const fetchBudget = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error("User not found:", userError?.message);
        router.push("/login");
        return;
      }

      const user_id = userData.user.id;
      setUserId(user_id);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("budget")
        .eq("user_id", user_id)
        .single();

      if (!error) {
        setEstimatedBudget(profile?.budget || 0);
      }

      const { data: items, error: itemsError } = await supabase
        .from("budget_items")
        .select("id, category, allocated, spent")
        .eq("user_id", user_id);

      if (!itemsError) {
        setBudgetItems(items || []);
      }

      setLoadingProfile(false);
    };

    fetchBudget();
  }, [supabase, router]);

  const totalAllocated = budgetItems.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const remainingBudget = estimatedBudget - totalAllocated;
  const progress = estimatedBudget > 0 ? (totalSpent / estimatedBudget) * 100 : 0;

  const addBudgetItem = async () => {
    if (newCategory && newAllocated && userId) {
      const allocated = parseFloat(newAllocated);
      const { error } = await supabase.from("budget_items").insert([
        { user_id: userId, category: newCategory, allocated, spent: allocated },
      ]);

      if (!error) {
        setNewCategory("");
        setNewAllocated("");
        setBudgetItems([
          ...budgetItems,
          { id: Date.now(), category: newCategory, allocated, spent: allocated },
        ]);
      }
    }
  };

  const deleteBudgetItem = async (id: string) => {
    const { error } = await supabase.from("budget_items").delete().eq("id", id);
    if (!error) {
      setBudgetItems(budgetItems.filter((item) => item.id !== id));
    }
  };

  const handleSpentChange = async (id: string, value: string) => {
    const spent = parseFloat(value) || 0;
    const { error } = await supabase.from("budget_items").update({ spent }).eq("id", id);
    if (!error) {
      setBudgetItems(
        budgetItems.map((item) => (item.id === id ? { ...item, spent } : item))
      );
    }
  };

  if (loadingProfile) {
    return (
      <div className="text-center py-10 text-gray-500 animate-pulse">
        Loading your budget details...
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl sm:text-4xl font-bold text-blue-400 mb-6 text-center">
        Wedding Budget
      </h2>

      {/* Budget Overview */}
      <Card className="p-4 sm:p-6 bg-white shadow-lg border-blue-300 border-2">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl text-cyan-300">Budget Overview</CardTitle>
          <CardDescription className="text-gray-600">
            Estimated budget from signup:{" "}
            <span className="text-green-400 font-semibold">
              ${estimatedBudget.toLocaleString()}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center p-4 bg-pink-400/10 rounded-lg shadow-sm">
            <div className="text-sm sm:text-lg text-gray-600">Total Allocated</div>
            <div className="text-2xl sm:text-3xl font-bold">${totalAllocated.toLocaleString()}</div>
          </div>
          <div className="text-center p-4 bg-blue-300/10 rounded-lg shadow-sm">
            <div className="text-sm sm:text-lg text-gray-600">Total Spent</div>
            <div className="text-2xl sm:text-3xl font-bold text-red-300">${totalSpent.toLocaleString()}</div>
          </div>
          <div className="text-center p-4 bg-cyan-300/10 rounded-lg shadow-sm">
            <div className="text-sm sm:text-lg text-gray-600">Remaining</div>
            <div className={`text-2xl sm:text-3xl font-bold ${remainingBudget >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${remainingBudget.toLocaleString()}
            </div>
          </div>
          <div className="md:col-span-3 mt-4">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-2 sm:space-y-0">
              <Progress value={progress} className="h-3 w-full bg-blue-300/30 [&>*]:bg-red-300" />
              <span className="text-base sm:text-lg font-semibold text-green-400">{Math.round(progress)}% Spent</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Breakdown */}
      <Card className="p-4 sm:p-6 bg-white shadow-lg border-blue-300 border-2 group hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl text-cyan-300 group-hover:text-purple-500 transition-colors">
            Budget Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Responsive Table */}
          <div className="overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow className="bg-pink-500/20">
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-gradient-to-br from-pink-400 to-blue-400 transition-colors duration-200"
                  >
                    <TableCell className="font-medium text-gray-800">{item.category}</TableCell>
                    <TableCell className="text-right text-gray-700">${item.allocated.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={item.spent}
                        onChange={(e) => handleSpentChange(item.id, e.target.value)}
                        className="w-20 sm:w-24 text-right border-red-300 focus:border-green-400 focus:ring-green-400"
                      />
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={item.allocated - item.spent >= 0 ? "text-green-600" : "text-red-600"}>
                        ${(item.allocated - item.spent).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteBudgetItem(item.id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Add Item Form - Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-6 p-4 bg-pink-500/10 rounded-lg shadow-inner space-y-2 sm:space-y-0">
            <Input
              placeholder="New Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 border-pink-500/50 focus:border-green-400 focus:ring-green-400"
            />
            <Input
              type="number"
              placeholder="Allocated Amount"
              value={newAllocated}
              onChange={(e) => setNewAllocated(e.target.value)}
              className="w-full sm:w-40 border-pink-500/50 focus:border-green-400 focus:ring-green-400"
            />
            <Button
              onClick={addBudgetItem}
              className="bg-red-300 hover:bg-green-400 text-white shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
            >
              <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}







