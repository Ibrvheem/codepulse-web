"use client";

import ControlledInput from "@/components/molecules/controlled-input";
import ControlledSelect from "@/components/molecules/controlled-select";
import ControlledTextarea from "@/components/molecules/controlled-textarea";
import { BODY_MAX, CATEGORY_OPTIONS } from "../types";

/** Shared by the "New post" and "Edit post" dialogs. */
export function FeedbackPostFields() {
  return (
    <>
      <ControlledInput
        name="title"
        label="Title"
        placeholder="Short and specific — e.g. Export summaries as Markdown"
        autoComplete="off"
      />
      <ControlledSelect
        name="category"
        label="Category"
        placeholder="Pick a category"
        values={CATEGORY_OPTIONS}
      />
      <ControlledTextarea
        name="body"
        label="Details"
        placeholder="What's the problem, or what would this let you do?"
        rows={6}
        maxLength={BODY_MAX}
      />
    </>
  );
}
