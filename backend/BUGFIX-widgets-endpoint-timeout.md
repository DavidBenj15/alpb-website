# Bug Fix: Widgets Endpoint Timeout

## Issue
- **Symptom**: The Home tab was taking an extremely long time to load and eventually failing with a "socket hang up" error when making requests to the `/api/widgets` endpoint.
- **Error Message**: 
  ```
  Failed to proxy http://localhost:3002/api/widgets?userId=122
  Error: socket hang up
  ```

## Root Cause
- The `getAllWidgets` function in `widgetService.js` was performing complex database queries with multiple joins and aggregations, including:
  - Multiple LEFT JOINs to the `widget_metrics` table for different timeframes (weekly, monthly, yearly, all_time)
  - Complex JSON aggregation of metrics data
  - This caused the database query to take too long to execute, leading to connection timeouts

## Fix Implemented
1. Removed all metrics-related calculations from the main widget query:
   - Removed JOINs to the `widget_metrics` table
   - Removed the JSONB_BUILD_OBJECT that was constructing the metrics data
   - Simplified the SELECT statement to only include essential widget data

2. The metrics data can be loaded separately when needed (e.g., when viewing widget details) rather than on the initial widget list load.

## Impact
- **Before**: The query was timing out, making the Home tab unusable
- **After**: The widget list should load quickly without timeouts
- **Trade-off**: Metrics data is no longer included in the initial widget list load (can be loaded on demand if needed)

## How to Test
1. Restart the backend server
2. Navigate to the Home tab
3. Verify that the widget list loads quickly without any timeout errors
4. Confirm that basic widget information (name, description, etc.) is displayed correctly

## Future Improvements
1. Consider implementing pagination for the widget list if the number of widgets grows large
2. If metrics are needed, implement a separate endpoint to load them on demand
3. Add database indexes on frequently queried columns to improve performance
4. Consider implementing caching for the widget list if it doesn't change frequently
