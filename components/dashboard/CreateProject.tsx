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

export function CreateProject() {
  const router = useRouter();
  const { mutate: createProject, isPending } = useCreateProject(
    (data) => {
      router.push(`/project/${data.id}`);
    },
    () => {
      console.error("Error creating project:");
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

  const handleSubmit = () => {
    const nameInput = document.getElementById("name") as HTMLInputElement;
    const descriptionInput = document.getElementById(
      "description"
    ) as HTMLTextAreaElement;

    const title = nameInput?.value?.trim() || generateSarcasticTitle();
    const description =
      descriptionInput?.value?.trim() || generateSarcasticDescription();

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
        <Button variant="outline">+ New</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            {"Don't worry, we'll fill it automatically with generic placeholder text because who has time for creativity these days?"}
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
