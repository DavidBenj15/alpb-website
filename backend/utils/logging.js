export function logWithFunctionName(obj) {
  const stack = new Error().stack; // Get the stack trace
  const caller = stack.split('\n')[2].trim(); // Extract the second line
if (typeof obj === 'object' && obj !== null) {
    // Pretty-print objects
    console.log(`[DEBUG: ${caller}]:`, JSON.stringify(obj, null, 2));
  } else {
    // Log primitives directly
    console.log(`[DEBUG: ${caller}]:`, obj);
  }
}