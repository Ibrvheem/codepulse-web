import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useState } from "react";
import { GenerateKeyData, generateKeySchema } from "../../types";
import { generateKey } from "../../service";

export function useGenerateKey({ defaultValues }: { defaultValues: Partial<GenerateKeyData> }) {
    const form = useForm<GenerateKeyData>({
        resolver: zodResolver(generateKeySchema),
        defaultValues,
    });
    const {
        formState: { isSubmitting },
    } = form;
    const { handleSubmit } = form;
    const [open, setOpen] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);

    const onSubmit = handleSubmit(async (data: GenerateKeyData) => {
        try {

            const response = await generateKey(data);

            toast.success("PAT KEY created successfully");
            console.log("PAT KEY created:", response);

            // Set the generated key to show it to the user
            if (response && response.key) {
                setGeneratedKey(response.key);
            } else {
                form.reset();
                setOpen(false);
            }

            return response;
        } catch (error) {
            toast.error("Failed to create PAT KEY");
            console.error("Error creating PAT KEY:", error);
        }
    });

    const handleClose = () => {
        form.reset();
        setGeneratedKey(null);
        setOpen(false);
    };

    return {
        form,
        isSubmitting,
        onSubmit,
        open,
        setOpen,
        generatedKey,
        handleClose,
    };
}
