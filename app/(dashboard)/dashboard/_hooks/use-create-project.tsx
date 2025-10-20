import { useForm } from "react-hook-form";
import { NewProjectData, newProjectSchema } from "../types";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createProject } from "../service";

export function useCreateProject() {
  const form = useForm<NewProjectData>({
    resolver: zodResolver(newProjectSchema),
  });
  const {
    formState: { isSubmitting },
  } = form;
  const { handleSubmit } = form;

  const onSubmit = handleSubmit(async (data: NewProjectData) => {
    try {
      // Remove repoUrl if it's empty before sending the request
      const requestData = { ...data };
      if (!requestData.repoUrl) {
        delete requestData.repoUrl;
      }
      const response = await createProject(requestData);

      toast.success(response.message ?? "Project created successfully");
      form.reset();
      return response;
    } catch (error) {
      toast.error("Failed to create project");
      console.error("Error creating project:", error);
    }
  });
  return {
    form,
    isSubmitting,
    onSubmit,
  };
}
