import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const ScheduleDonationModal = ({ open, setOpen, onSuccess }) => {
  const [center, setCenter] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!center || !date || !time) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/donor/schedule",
        { center, date, time },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Donation scheduled successfully");
      
      // Call onSuccess callback to refresh dashboard
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error("Failed to schedule donation");
      console.error(error);
    }
    
    // Always reset and close
    setLoading(false);
    setCenter("");
    setDate("");
    setTime("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Donation</DialogTitle>
        </DialogHeader>

        {/* Donation Center */}
        <Select onValueChange={setCenter}>
          <SelectTrigger>
            <SelectValue placeholder="Select Donation Center" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="City Hospital">City Hospital</SelectItem>
            <SelectItem value="Red Cross Camp">Red Cross Camp</SelectItem>
            <SelectItem value="Community Health Center">
              Community Health Center
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Date */}
        <Input type="date" onChange={(e) => setDate(e.target.value)} />

        {/* Time */}
        <Input type="time" onChange={(e) => setTime(e.target.value)} />

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Scheduling..." : "Confirm Donation"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleDonationModal;
