"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModal";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const AddNewInterview = () => {
  const [openDailog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();

      if (!jobPosition || !jobDesc || !jobExperience) {
        toast.error("Please fill in all fields");
        return;
      }

      const InputPrompt = `
        Job Position: ${jobPosition}
        Job Description: ${jobDesc}
        Years of Experience: ${jobExperience}
        Generate 5 relevant interview questions with detailed answers for this position. 
        Format the response as a JSON array where each object has "Question" and "Answer" fields.
        Ensure the questions are appropriate for the experience level and cover key aspects of the job description.
      `;

      const result = await chatSession.sendMessage(InputPrompt);
      let MockJsonResp = result.response.text().trim();
      
      // Clean up the JSON response
      MockJsonResp = MockJsonResp.replace(/```json|```/g, "").trim();
      
      // Validate JSON
      try {
        JSON.parse(MockJsonResp);
      } catch (error) {
        console.error("Invalid JSON response:", error);
        toast.error("Failed to generate interview questions. Please try again.");
        return;
      }

      const mockId = uuidv4();
      const resp = await db.insert(MockInterview).values({
        mockId,
        jsonMockResp: MockJsonResp,
        jobPosition,
        jobDesc,
        jobExperience,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("YYYY-MM-DD"),
      }).returning({
        mockId: MockInterview.mockId
      });

      if (resp && resp[0]?.mockId) {
        toast.success("Interview created successfully!");
        setOpenDialog(false);
        router.push("/dashboard/interview/" + resp[0].mockId);
      } else {
        toast.error("Failed to create interview");
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      toast.error("An error occurred while creating the interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="p-10 rounded-lg border bg-secondary hover:scale-105 hover:shadow-sm transition-all cursor-pointer"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg text-center">+ Add New Interview</h2>
      </div>
      <Dialog open={openDailog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Interview</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit}>
            <div className="my-3">
              <h2>Add Details about your job position, job description and years of experience</h2>
              <div className="mt-7 my-3">
                <label className="text-black">Job Role/Job Position</label>
                <Input
                  className="mt-1"
                  placeholder="Ex. Full Stack Developer"
                  required
                  value={jobPosition}
                  onChange={(e) => setJobPosition(e.target.value)}
                />
              </div>
              <div className="my-5">
                <label className="text-black">Job Description/Tech Stack</label>
                <Textarea
                  className="mt-1"
                  placeholder="Ex. React, Node.js, PostgreSQL, AWS"
                  required
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                />
              </div>
              <div className="my-5">
                <label className="text-black">Years of Experience</label>
                <Input
                  className="mt-1"
                  type="number"
                  placeholder="Ex. 3"
                  required
                  value={jobExperience}
                  onChange={(e) => setJobExperience(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </Button>
              <Button disabled={loading} type="submit">
                {loading ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Generate Interview
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;
