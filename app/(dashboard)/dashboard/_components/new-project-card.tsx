"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Plus, Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/molecules/controlled-input";
import ControlledTextarea from "@/components/molecules/controlled-textarea";
import { useCreateProject } from "../_hooks/use-create-project";

export default function NewProjectCard() {
  const [isHovered, setIsHovered] = useState(false);
  const { form, isSubmitting, onSubmit } = useCreateProject();

  return (
    <div
      className={cn("relative group block p-2 h-full w-full")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.span
            className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block rounded-3xl"
            layoutId="newProjectHoverBackground"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.15 },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.15, delay: 0.2 },
            }}
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          "rounded-2xl h-full w-full p-4 overflow-hidden bg-white border-2 border-dashed border-indigo-300 hover:border-indigo-400 transition-colors duration-200 relative z-20 min-h-[200px] flex flex-col"
        )}
      >
        <div className="relative z-50 flex-1">
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4 font-medium">
              <Plus className="h-6 w-6 text-indigo-600 bg-indigo-600/10 rounded-full p-1" />{" "}
              <h3>New Project</h3>{" "}
            </div>

            <Form {...form}>
              <div className="mb-4">
                <ControlledInput
                  name="name"
                  placeholder="Project name"
                  disabled={isSubmitting}
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="mb-4 flex-1">
                <ControlledTextarea
                  className="border-0"
                  name="description"
                  placeholder="Project description"
                  disabled={isSubmitting}
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <ControlledInput
                  name="repoUrl"
                  placeholder="Project repoUrl (optional)"
                  type="url"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
                {form.formState.errors.repoUrl && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.repoUrl.message}
                  </p>
                )}
              </div>

              <motion.button
                onClick={() => onSubmit()}
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </motion.button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
