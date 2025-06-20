"use client";
import { useForm } from "react-hook-form";
import { Input, Textarea, Button, Card, CardBody } from "@heroui/react";
import { FaSave, FaTimes } from "react-icons/fa";

interface PlaceFormData {
  title: string;
  description: string;
}

interface PlaceFormProps {
  initialData?: {
    title: string;
    description: string | null;
  };
  onSubmit: (data: PlaceFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitText?: string;
}

export default function PlaceForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitText = "Save Place",
}: PlaceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<PlaceFormData>({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
    },
    mode: "onChange",
  });

  const onFormSubmit = async (data: PlaceFormData) => {
    try {
      await onSubmit(data);
      if (!initialData) {
        // Only reset if it's a new place
        reset();
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Card className="shadow-none">
      <CardBody>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Title Field */}
          <div>
            <Input
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 2,
                  message: "Title must be at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Title must be less than 100 characters",
                },
              })}
              label="Place Title"
              placeholder="Enter a name for this place"
              variant="bordered"
              isInvalid={!!errors.title}
              errorMessage={errors.title?.message}
              isRequired
            />
          </div>

          {/* Description Field */}
          <div>
            <Textarea
              {...register("description", {
                maxLength: {
                  value: 500,
                  message: "Description must be less than 500 characters",
                },
              })}
              label="Description"
              placeholder="Add a description for this place..."
              variant="bordered"
              minRows={3}
              maxRows={6}
              isInvalid={!!errors.description}
              errorMessage={errors.description?.message}
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="light"
              onPress={onCancel}
              disabled={isLoading}
              startContent={<FaTimes />}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              color="primary"
              disabled={!isValid || isLoading}
              isLoading={isLoading}
              startContent={!isLoading && <FaSave />}
            >
              {isLoading ? "Saving..." : submitText}
            </Button>
          </div>

          {/* Form Status */}
          {initialData && !isDirty && (
            <p className="text-sm text-gray-500 text-center">
              No changes to save
            </p>
          )}
        </form>
      </CardBody>
    </Card>
  );
}
