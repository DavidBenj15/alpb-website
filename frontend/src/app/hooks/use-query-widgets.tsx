import { fetchWidgets } from "@/api/widget";
import { WidgetType } from "@/data/types";
import { setWidgets, $widgets, setFavWidgetIds } from "@/lib/store";
import { useStore } from "@nanostores/react";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getFavorites } from "@/api/user";

function useQueryWidgets() {
  const widgets = useStore($widgets);
  const { userId, userRole } = useAuth();

  const loadWidgets = async () => {
    try {
      const fetchedWidgets = await fetchWidgets();
      // Check if the user is a Widget Developer
      const isDev = userRole == "Widget Developer" ? true : false;
      // Filter widgets based on the user role and developer IDs
      const filteredWidgets = fetchedWidgets.filter((widget) =>
        isDev && userId && widget.developerIds?.includes(userId)
          ? widget
          : !isDev,
      );
      setWidgets([...filteredWidgets]);
      // Fetch favorite widget IDs for the user
      const favWidgetIds = await getFavorites(parseInt(userId));
      setFavWidgetIds(favWidgetIds);
    } catch (error) {
      console.error("Error fetching widgets", error);
    }
  };

  useEffect(() => {
    loadWidgets();
  }, [userId]);     // eslint-disable-line

  return { widgets };
}

export default useQueryWidgets;
