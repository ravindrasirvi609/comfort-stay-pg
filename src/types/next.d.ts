import { NextRequest } from "next/server";

declare module "next/server" {
  export interface RouteSegment {
    params: Record<string, string>;
  }
}
