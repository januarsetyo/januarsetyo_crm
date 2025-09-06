import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserTable from "./Tables/UserTables";
import PageMeta from "../components/common/PageMeta";

export default function User() {
  return (
    <>
      <PageMeta
        title="Data User - Customer Relationship Management System"
        description="Data User - Customer Relationship Management System"
      />
      <PageBreadcrumb pageTitle="Data User" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Data User
        </h3>
        <div className="space-y-6">
          <UserTable />

        </div>
      </div>
    </>
  );
}
