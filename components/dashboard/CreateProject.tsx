import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProject } from "@/hooks/useProject";
import { useRouter } from "next/navigation";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast"

export function CreateProject() {
  const { toast } = useToast();
  const router = useRouter();
  const { mutate: createProject, isPending } = useCreateProject(
    (data) => {
      router.push(`/project/${data.id}`);
    },
    () => {
      console.error("Error creating project:");
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  );

  const generateSarcasticTitle = () => {
    const titles = [
      "Yet Another Brilliant Project",
      "This Will Definitely Get Done",
      "Project McProjectFace",
      "The Next Big Thing™",
      "Procrastination Central",
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const generateSarcasticDescription = () => {
    const descriptions = [
      "Another groundbreaking project that will revolutionize... something, probably.",
      "This project is so exciting, I can barely contain my overwhelming indifference.",
      "Join us on this journey to create something that might actually get finished someday.",
      "A project so innovative, we haven't even figured out what it does yet.",
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = () => {

    const title = formData.name.trim() || generateSarcasticTitle();
    const description = formData.description.trim() || formData.name.trim() ? '': generateSarcasticDescription();

    if (title.length > 255 || description.length > 1000) {
      toast({
        title: "Error",
        description: "Title and description must be less than 255 and 1000 characters respectively.",
      });
      return;
    }

    createProject({
      title,
      description,
      imageUrl: `https://picsum.photos/300/175?random=${Math.floor(
        Math.random() * 1000
      )}`,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">+ New</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            {
              "Are you lazy? We'll fill it automatically with generic placeholder text because who has time for creativity these days."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-start gap-2">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              placeholder="Do you have a name in mind?"
              className="col-span-3"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-col items-start gap-2">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Oh yes, another *thrilling* project description..."
              onChange={handleInputChange}
              value={formData.description}
            />
          </div>
        </div>
        <DialogFooter className="flex !justify-between">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" isLoading={isPending} onClick={handleSubmit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
