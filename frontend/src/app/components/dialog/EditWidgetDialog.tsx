/**
 * EditWidgetDialog Component
 *
 * A dialog for editing widget details. It allows users to update a widget's title, description,
 * deployment link, and visibility. Changes are saved via the `editWidget` mutation, and the dialog
 * can be closed using the `onClose` callback.
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog"; // UI components for the alert dialog
import { Input } from "../ui/input"; // Input component
import { Label } from "../ui/label"; // Label component
import { Checkbox } from "../ui/checkbox"; // Checkbox component
import { useEffect, useState } from "react"; // React state management
import { useStore } from "@nanostores/react"; // Hook to access nanostores
import { $targetWidget } from "@/lib/store"; // Store to manage the target widget being edited
import useMutationWidgets from "@/app/hooks/use-mutation-widgets"; // Hook for widget mutations
import IconSelector from "./IconSelector";

/**
 * Props for the EditWidgetDialog component.
 * @property {boolean} isOpen - Whether the dialog is open.
 * @property {() => void} onClose - Callback to close the dialog.
 */
interface EditWidgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * EditWidgetDialog Component
 *
 * @param {EditWidgetDialogProps} props - Props for the component.
 * @returns {JSX.Element} - The JSX representation of the dialog.
 */
const EditWidgetDialog: React.FC<EditWidgetDialogProps> = ({
  isOpen,
  onClose,
}) => {
  // Access the target widget from the store
  const targetWidget = useStore($targetWidget);

  // Local state for widget fields
  const [name, setName] = useState(targetWidget.name || "");
  const [description, setDescription] = useState(
    targetWidget.description || "",
  );
  const [deploymentLink, setDeploymentLink] = useState(
    targetWidget.redirectLink || "",
  );
  const [visibility, setVisibility] = useState(
    targetWidget.visibility || "Private",
  );
  const [imageUrl, setImageUrl] = useState(targetWidget.imageUrl || "default");

  const { editWidget } = useMutationWidgets(); // Hook for editing widgets

  /**
   * Handles saving the updated widget details.
   * Calls the `editWidget` mutation and closes the dialog on success.
   */
  const handleSave = async () => {
    try {
      await editWidget({
        id: targetWidget.id,
        name,
        description,
        redirectLink: deploymentLink,
        visibility,
        imageUrl,
      });
      onClose(); // Close the dialog after saving
    } catch (error) {
      console.error("Error updating widget:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Widget</AlertDialogTitle>
          <AlertDialogDescription>
            {/* {"Update the widget's details below and save your changes."} */}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 30))}
              placeholder="Widget Title"
              maxLength={30}
            />
          </div>

          {/* Description Input */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 100))}
              placeholder="Widget Description"
              maxLength={100}
            />
          </div>

          {/* Deployment Link Input */}
          <div>
            <Label htmlFor="deploymentLink">Deployment Link</Label>
            <Input
              id="deploymentLink"
              value={deploymentLink}
              onChange={(e) => setDeploymentLink(e.target.value.slice(0, 100))}
              placeholder="https://example.com"
              maxLength={100}
            />
          </div>

          <div>
            <Label>Icon</Label>
            <IconSelector setImgUrl={setImageUrl} imgUrl={imageUrl} />
          </div>

          {/* Visibility Options */}
          <div>
            <Label>Visibility</Label>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="visibility-private"
                  checked={visibility === "Private"}
                  onCheckedChange={() => setVisibility("Private")}
                />
                <Label htmlFor="visibility-private">Private</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="visibility-public"
                  checked={visibility === "Public"}
                  onCheckedChange={() => setVisibility("Public")}
                />
                <Label htmlFor="visibility-public">Public</Label>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSave}>Save</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditWidgetDialog;
