import { fetchWidgets } from "@/api/widget";
import { WidgetType } from "@/data/types";
import { setWidgets, $widgets, setFavWidgetIds, $user } from "@/lib/store";
import { useStore } from "@nanostores/react";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getFavorites } from "@/api/user";

function useQueryWidgets() {
  const widgets = useStore($widgets);
  const user = useStore($user);

  const loadWidgets = async () => {
    try {
      const fetchedWidgets = await fetchWidgets();
      // Check if the user is a Widget Developer
      const isDev = user.role.toLowerCase() == "widget developer" ? true : false;
      // Filter widgets based on the user role and developer IDs
      const filteredWidgets = fetchedWidgets.filter((widget) =>
        isDev && user.id && widget.developerIds?.includes(String(user.id))
          ? widget
          : !isDev,
      );
      setWidgets([...filteredWidgets]);
      // Fetch favorite widget IDs for the user
      const favWidgetIds = await getFavorites(user.id);
      setFavWidgetIds(favWidgetIds);
    } catch (error) {
      console.error("Error fetching widgets", error);
    }
  };

  useEffect(() => {
    loadWidgets();
  }, [user.id]); // eslint-disable-line

  return { widgets };
}

export default useQueryWidgets;
