import { atom, map } from "nanostores";
import { persistentMap } from '@nanostores/persistent'
import { UserType, WidgetType } from "@/data/types";
import { logger } from "@nanostores/logger";

// Allow debug messages
const DEBUG = false;

const emptyWidget: WidgetType = {
  id: -1,
  name: "empty widget",
};

export const $widgets = atom<WidgetType[]>([]);
export const $targetWidget = atom<WidgetType>(emptyWidget);
export const $widgetQuery = atom<string>("");
export const $favWidgetIds = atom<Set<number>>(new Set());
export const $filters = atom<Set<string>>(new Set());
export const $activeCategoryIds = atom<Set<number>>(new Set([1, 2, 3]));
export const $widgetsVersion = atom<number>(0);
export const $filtersVersion = atom<number>(0);

// Adds a new widget to the $widgets store and increments the widgets version
export function addWidget(widget: WidgetType) {
  $widgets.set([...$widgets.get(), widget]);
  incrementWidgetsVersion();
}

// Sets the $widgets store to a new array of widgets and increments the widgets version
export function setWidgets(widgets: WidgetType[]) {
  $widgets.set([...widgets]);
  incrementWidgetsVersion(); // Since react detects changes in object REFERENCE,
  // we instead update a speparate var. for the set version, which will trigger
  // re-renders
}

// Sets the target widget in the $targetWidget store
export function setTargetWidget(target: WidgetType) {
  $targetWidget.set(target);
}

// Updates a widget in the $widgets store by matching the id and increments the widgets version
export function updateStoreWidget({
  id,
  name,
  description,
  visibility,
  redirectLink,
  imageUrl,
}: WidgetType) {
  $widgets.set(
    $widgets.get().map((widget) => {
      if (widget.id === id) {
        return {
          ...widget,
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(visibility !== undefined && { visibility }),
          ...(redirectLink !== undefined && { redirectLink }),
          ...(imageUrl !== undefined && { imageUrl }),
        };
      } else {
        return widget;
      }
    }),
  );
  incrementWidgetsVersion();
}

// Sets the widget query in the $widgetQuery store and increments the filters version
export function setWidgetQuery(query: string) {
  $widgetQuery.set(query);
  incrementFiltersVersion();
}

// Adds a widget ID to the $favWidgetIds store and increments the filters version
export function addFavWidgetId(id: number) {
  $favWidgetIds.set($favWidgetIds.get().add(id));
  incrementFiltersVersion();
}

// Removes a widget ID from the $favWidgetIds store and increments the filters version
export function removeFavWidgetId(id: number) {
  const favWidgetIds = $favWidgetIds.get();
  favWidgetIds.delete(id);
  $favWidgetIds.set(favWidgetIds);
  incrementFiltersVersion();
}

// Sets the $favWidgetIds store to a new set of IDs and increments the filters version
export function setFavWidgetIds(ids: number[]) {
  $favWidgetIds.set(new Set(ids));
  incrementFiltersVersion();
}

// Retrieves the favorite widget IDs from the $favWidgetIds store
export function getFavWidgetIds() {
  return $favWidgetIds.get();
}

// Adds a filter to the $filters store and increments the filters version
export function addFilter(filter: string) {
  $filters.set($filters.get().add(filter));
  incrementFiltersVersion();
}

// Removes a filter from the $filters store and increments the filters version
export function removeFilter(filter: string) {
  const filters = $filters.get();
  filters.delete(filter);
  $filters.set(filters);
  incrementFiltersVersion();
}

// Adds a category ID to the $activeCategoryIds store and increments the filters version
export function addCategoryId(id: number) {
  $activeCategoryIds.set($activeCategoryIds.get().add(id));
  incrementFiltersVersion();
}

// Removes a category ID from the $activeCategoryIds store and increments the filters version
export function removeCategoryId(id: number) {
  const categories = $activeCategoryIds.get();
  categories.delete(id);
  $activeCategoryIds.set(categories);
  incrementFiltersVersion();
}

// Increments the filters version to trigger re-rendering
export function incrementFiltersVersion() {
  $filtersVersion.set($filtersVersion.get() + 1);
}

// Increments the widgets version to trigger re-rendering
export function incrementWidgetsVersion() {
  $widgetsVersion.set($widgetsVersion.get() + 1);
}

////////////////////
/////// User ///////
////////////////////
const emptyUser: UserType = {
  id: "",
  first: "",
  last: "",
  email: "",
  role: "",
}

export const $user = persistentMap<UserType>("user:", emptyUser);

export function setUser(user: UserType) {
  $user.set(user);
}

export function clearUser() {
  $user.set(emptyUser);
}

// Logger for nanostores
let destroy =
  DEBUG &&
  logger({
    User: $user
  });
