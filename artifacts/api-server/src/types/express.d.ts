import { Usuario } from "@workspace/db";

declare global {
  namespace Express {
    interface User extends Usuario {}
  }
}
