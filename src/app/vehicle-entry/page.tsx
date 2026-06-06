import { redirect } from "next/navigation";
import { isAuthenticated } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/db";
import User from "@/app/api/models/User";
import VehicleEntryClient, {
  VehicleEntryUser,
} from "@/components/VehicleEntryClient";

export default async function VehicleEntryPage() {
  const { isAuth, user } = await isAuthenticated();

  if (!isAuth || !user) {
    redirect("/login?redirect=/vehicle-entry");
  }

  await connectToDatabase();

  const userData = await User.findById(user._id)
    .select("name pgId vehicleNumber roomId")
    .populate("roomId", "roomNumber")
    .lean();

  if (!userData) {
    redirect("/login?redirect=/vehicle-entry");
  }

  const serializedUser = JSON.parse(
    JSON.stringify(userData)
  ) as VehicleEntryUser;

  return <VehicleEntryClient initialUser={serializedUser} />;
}
