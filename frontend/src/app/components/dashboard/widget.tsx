/**
 * Widget Component
 *
 * This component represents a single widget, displaying its information and providing actions 
 * such as editing, launching, and favoriting. It uses `Card` as the container for a structured layout.
 * Developers (`isDev` users) can edit the widget details, and all users can toggle the favorite state.
 */

import React, { useState } from "react";
import { Button } from "../ui/button"; // Styled button component
import Image from "next/image"; // Next.js image optimization component
import { HeartIcon, HeartFilledIcon, AngleIcon } from "@radix-ui/react-icons"; // Radix UI icons
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"; // Card UI components
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar"; // Avatar UI components
import EditWidgetDialog from "@/app/components/dialog/EditWidgetDialog"; // Widget edit dialog
import { WidgetType } from "@/data/types"; // Type definitions for widgets
import { useStore } from "@nanostores/react"; // Nanostores for state management
import { $favWidgetIds, setTargetWidget } from "@/lib/store"; // Global state and actions
import useMutationWidgets from "@/app/hooks/use-mutation-widgets"; // Custom hook for widget mutations

/**
 * WidgetProps Interface
 *
 * @property {boolean} isDev - Indicates whether the user is a developer with edit permissions.
 * @property {boolean} isFavorite - Indicates if the widget is in the user's favorites.
 */
interface WidgetProps extends WidgetType {
  isDev: boolean;
  visibility: string;
  isFavorite: boolean;
}

/**
 * Widget Component
 *
 * @param {WidgetProps} props - Props containing widget data and user state.
 * @returns {JSX.Element} - The JSX representation of a widget.
 */
export default function Widget({
  id,
  name,
  description,
  imageUrl,
  isDev,
  visibility,
  redirectLink,
}: WidgetProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Local state for dialog visibility
  const { toggleFavWidget } = useMutationWidgets(); // Custom hook for toggling favorites
  const favWidgets = useStore($favWidgetIds); // Global state for favorite widgets

  /**
   * Handles widget redirection.
   * @TODO Implement redirect logic.
   */
  const redirect = () => {
    console.log("Redirect to:", redirectLink); // Placeholder for redirection logic
  };

  /**
   * Toggles the widget's favorite status.
   */
  const handleToggleFav = () => {
    toggleFavWidget(id);
  };

  /**
   * Opens the edit dialog for the widget.
   * Sets the target widget in global state and shows the dialog.
   */
  const handleOpenDialog = () => {
    setTargetWidget({
      id,
      name,
      description,
      imageUrl,
      visibility,
      redirectLink,
    });
    setIsDialogOpen(true);
  };

  return (
    <Card className="w-[350px]">
      {/* Header Section */}
      <CardHeader>
        <div className="flex items-center">
          {/* Avatar with fallback */}
          <Avatar className="mr-5">
            <AvatarImage src={imageUrl || ""} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <CardTitle>{name}</CardTitle>
        </div>
      </CardHeader>

      {/* Image Section */}
      <div className="flex justify-center bg-gray-50 w-full mb-5">
        <div className="h-[175px] py-5 flex justify-center items-center">
          {imageUrl ? (
            <Image src={imageUrl} alt={name} width="150" height="150" />
          ) : (
            <AngleIcon className="size-10 fill-current text-gray-400" />
          )}
        </div>
      </div>

      {/* Content Section */}
      <CardContent>
        <CardTitle className="mb-3">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardContent>

      {/* Footer Section */}
      <CardFooter className="flex justify-between">
        {/* Edit Button for Developers */}
        {isDev && (
          <Button variant="outline" onClick={handleOpenDialog}>
            Edit
          </Button>
        )}
        <div>
          {/* Launch Button */}
          <Button className="ml-3" onClick={redirect}>
            Launch
          </Button>

          {/* Favorite Button */}
          <Button variant="ghost" onClick={handleToggleFav}>
            {favWidgets.has(id) ? <HeartFilledIcon /> : <HeartIcon />}
          </Button>
        </div>
      </CardFooter>

      {/* Edit Dialog */}
      {isDialogOpen && (
        <EditWidgetDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </Card>
  );
}

