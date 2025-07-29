"use client";

import { useState, useEffect } from "react";
import { Plus, Clock, Utensils, Baby, Edit, Trash2, Calendar, Save } from "lucide-react";
import Input from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Feedingtips from "../components/Feedingtips";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function Page() {
  useEffect(() => {
    document.title = "Feeding | NeoNest";
  }, []);

  const router = useRouter();
  const { isAuth, token } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    time: "",
    type: "Breastfeeding",
    amount: "",
    notes: "",
  });

  useEffect(() => {
    if (!isAuth) {
      router.push("/Login");
    }
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get("/api/feeding", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSchedules(res.data.feed || []);
      } catch (err) {
        console.error("Error fetching feeds:", err);
      }
    };

    fetchSchedules();
  }, []);

  const handleAddSchedule = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/feeding`,
        newSchedule,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data)
      if (res.data.feed) {
        setSchedules((prev) => [...prev, res.data.feed]);
      }
      setNewSchedule({ time: "", type: "Breastfeeding", amount: "", notes: "" });
      setIsAddingSchedule(false);
    } catch (err) {
      console.error("Error adding feed:", err);
    }
  };

  const handleUpdateSchedule = async (id, updatedData) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/feeding`,
        { feedId: id, ...updatedData },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSchedules((prev) => prev.map((s) => (s._id === id ? { ...s, ...updatedData } : s)));
      setEditingSchedule(null);
    } catch (err) {
      console.error("Error updating feed:", err);
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/feeding`, {
        params: { feedId: id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSchedules((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Error deleting feed:", err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Breastfeeding":
        return Baby;
      case "Bottle":
      case "Solid Food":
        return Utensils;
      default:
        return Utensils;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Breastfeeding":
        return "bg-pink-400 text-pink-700";
      case "Bottle":
        return "bg-blue-400 text-blue-700";
      case "Solid Food":
        return "bg-green-400 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const todaySchedules = schedules;

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Feeding: Tips and Schedule</h2>
          <p className="text-gray-600">Track your baby's feeding times and learn best practices.</p>
        </div>
        <Button
          onClick={() => setIsAddingSchedule(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Feeding
        </Button>
      </div>

      {(isAddingSchedule || editingSchedule) && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold flex items-center gap-2 mt-3 mb-10">
            <Utensils className="w-5 h-5 text-pink-400" />
            {editingSchedule ? "Edit Feeding" : "Add New Feeding"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <Input
                type="time"
                value={editingSchedule ? editingSchedule.time : newSchedule.time}
                onChange={(e) =>
                  editingSchedule
                    ? setEditingSchedule({ ...editingSchedule, time: e.target.value })
                    : setNewSchedule({ ...newSchedule, time: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={editingSchedule ? editingSchedule.type : newSchedule.type}
                onChange={(e) =>
                  editingSchedule
                    ? setEditingSchedule({ ...editingSchedule, type: e.target.value })
                    : setNewSchedule({ ...newSchedule, type: e.target.value })
                }
              >
                <option value="Breastfeeding">Breastfeeding</option>
                <option value="Bottle">Bottle</option>
                <option value="Solid Food">Solid Food</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <Input
                placeholder="e.g., 4 oz, 30 min, 1/2 cup"
                value={editingSchedule ? editingSchedule.amount : newSchedule.amount}
                onChange={(e) =>
                  editingSchedule
                    ? setEditingSchedule({ ...editingSchedule, amount: e.target.value })
                    : setNewSchedule({ ...newSchedule, amount: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <Input
                placeholder="Optional notes"
                value={editingSchedule ? editingSchedule.notes : newSchedule.notes}
                onChange={(e) =>
                  editingSchedule
                    ? setEditingSchedule({ ...editingSchedule, notes: e.target.value })
                    : setNewSchedule({ ...newSchedule, notes: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={() =>
                editingSchedule
                  ? handleUpdateSchedule(editingSchedule._id, editingSchedule)
                  : handleAddSchedule()
              }
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Save className="w-4 h-4 mr-2" /> {editingSchedule ? "Update" : "Add"} Feeding
            </Button>
            <Button
              onClick={() => {
                setIsAddingSchedule(false);
                setEditingSchedule(null);
                setNewSchedule({ time: "", type: "Breastfeeding", amount: "", notes: "" });
              }}
              className="border border-gray-300"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-sm rounded-lg border p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          Today's Feeding Schedule
          <Badge>{todaySchedules.length} feedings</Badge>
        </h3>

        {todaySchedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Utensils className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No feedings scheduled for today</p>
            <Button
              onClick={() => setIsAddingSchedule(true)}
              className="mt-4 border border-gray-300 text-white"
            >
              <Plus className="w-4 h-4 mr-2" /> Add First Feeding
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {todaySchedules.map((s) => {
              if (!s || !s.type) return null;
              const Icon = getTypeIcon(s.type);
              return (
                <div
                  key={s._id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{s.time}</span>
                    </div>
                    <Badge className={getTypeColor(s.type)}>
                      <Icon className="w-3 h-3 mr-1" />
                      {s.type.charAt(0).toUpperCase() + s.type.slice(1)}
                    </Badge>
                    {s.amount && <span className="text-sm text-gray-600">{s.amount}</span>}
                    {s.notes && <span className="text-sm text-gray-500 italic">"{s.notes}"</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setEditingSchedule(s)} className="text-sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteSchedule(s._id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Feedingtips />
    </div>
  );
}