interface Props {
  page: number;
  totalPages: number | null;
  canPrev: boolean;
  canNext: boolean;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const PaginationControls = ({
  page,
  totalPages,
  canPrev,
  canNext,
  loading,
  onPrev,
  onNext,
}: Props) => {
  return (
    <div className="mt-4 flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          className="cursor-pointer rounded-md border border-gray-600 px-3 py-1.5 text-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={onPrev}
          disabled={!canPrev || loading}
        >
          قبلی
        </button>
        <button
          className="cursor-pointer rounded-md border border-gray-600 px-3 py-1.5 text-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={onNext}
          disabled={!canNext || loading}
        >
          بعدی
        </button>
      </div>
      <div className="text-gray-300">
        صفحه {page}
        {totalPages ? ` از ${totalPages}` : ""}
      </div>
    </div>
  );
};

export default PaginationControls;
