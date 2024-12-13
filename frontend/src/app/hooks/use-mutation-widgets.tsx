import { WidgetType } from "@/data/types";
import {
  $favWidgetIds,
  $user,
  addFavWidgetId,
  removeFavWidgetId,
  updateStoreWidget,
} from "@/lib/store";
import { updateWidget } from "@/api/widget";
import { useAuth } from "../contexts/AuthContext";
import { addFavorite, removeFavorite } from "@/api/user";
import { useStore } from "@nanostores/react";

function useMutationWidgets() {
  const user = useStore($user);
  const favWidgetIds = useStore($favWidgetIds); // Get the favorite widget IDs from the store

  const editWidget = async ({
    id,
    name,
    description,
    redirectUrl,
    visibility,
    imageUrl,
  }: WidgetType) => {
    try {
      const updatedWidget = await updateWidget({
        id,
        name,
        description,
        redirectUrl,
        visibility,
        imageUrl,
      });
      updateStoreWidget({
        id,
        name,
        description,
        visibility,
        redirectUrl,
        imageUrl,
      }); // Update the widget in the store
    } catch (error) {
      console.error("Error updating widget:", error);
    }
  };

  const toggleFavWidget = async (widgetId: number) => {
    try {
      if (favWidgetIds.has(widgetId)) {
        await removeFavorite(parseInt(user.id), widgetId); // Remove widget from favorites
        removeFavWidgetId(widgetId); // Update the store to reflect removal
        return "removed";
      } else {
        await addFavorite(parseInt(user.id), widgetId); // Add widget to favorites
        addFavWidgetId(widgetId); // Update the store to reflect addition
        return "added";
      }
    } catch (error) {
      console.error("Error updating widget:", error);
    }
  };

  return {
    editWidget,
    toggleFavWidget,
  };
}

export default useMutationWidgets;
