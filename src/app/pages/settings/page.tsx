import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { ApiAccessSection } from "./_components/api-access";
import { PersonalInfoForm } from "./_components/personal-info";
import { UploadPhotoForm } from "./_components/upload-photo";

export const metadata: Metadata = {
  title: "Settings Page",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1180px]">
      <Breadcrumb pageName="Settings" />

      <div className="grid grid-cols-5 gap-6 xl:gap-8">
        <div className="col-span-5 xl:col-span-3">
          <PersonalInfoForm />
        </div>
        <div className="col-span-5 xl:col-span-2">
          <UploadPhotoForm />
        </div>
        <div className="col-span-5">
          <ApiAccessSection />
        </div>
      </div>
    </div>
  );
};
