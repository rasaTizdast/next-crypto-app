import CoinsTable from "./components/CoinsTable";

const CoinsPage = async () => {
  return (
    <div className="relative mx-auto mt-19 flex w-full max-w-11/12 flex-col items-center justify-center gap-5 py-10 pt-5 sm:max-w-10/12 sm:pt-10">
      <CoinsTable />
    </div>
  );
};

export default CoinsPage;
