/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as attendance from "../attendance.js";
import type * as auth from "../auth.js";
import type * as children from "../children.js";
import type * as guardians from "../guardians.js";
import type * as http from "../http.js";
import type * as images from "../images.js";
import type * as myFunctions from "../myFunctions.js";
import type * as types_attendance from "../types/attendance.js";
import type * as types_children from "../types/children.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  attendance: typeof attendance;
  auth: typeof auth;
  children: typeof children;
  guardians: typeof guardians;
  http: typeof http;
  images: typeof images;
  myFunctions: typeof myFunctions;
  "types/attendance": typeof types_attendance;
  "types/children": typeof types_children;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
