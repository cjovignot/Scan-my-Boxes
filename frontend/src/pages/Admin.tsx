import PageWrapper from "../components/PageWrapper";
import UserInfos from "../components/UserInfos";

const Admin = () => {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center px-6 py-10 text-white bg-gray-950">
        {/* Titre principal */}
        <h1 className="mb-6 text-4xl font-bold text-center text-yellow-400">
          👤 Admin
        </h1>

        {/* Contenu : Liste des utilisateurs */}
        <UserInfos />

        {/* Footer / note */}
        <p className="mt-10 text-sm text-center text-gray-500">
          Informations des utilisateurs enregistrés dans la base.
        </p>
      </div>
    </PageWrapper>
  );
};

export default Admin;
