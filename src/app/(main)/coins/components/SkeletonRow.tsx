const SkeletonRow = ({ keyId }: { keyId: string | number }) => (
  <tr key={keyId} className="animate-pulse">
    <td className="px-8 py-3">
      <div className="flex items-center gap-x-3">
        <div className="h-10 w-10 rounded-full bg-gray-700" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-28 rounded bg-gray-700" />
          <div className="h-2 w-16 rounded bg-gray-700" />
        </div>
      </div>
    </td>
    <td className="px-8 py-4">
      <div className="h-3 w-24 rounded bg-gray-700" />
    </td>
    <td className="px-8 py-4">
      <div className="h-3 w-16 rounded bg-gray-700" />
    </td>
    <td className="px-8 py-4">
      <div className="h-3 w-28 rounded bg-gray-700" />
    </td>
    <td className="px-8 py-4">
      <div className="h-10 w-full rounded bg-gray-700" />
    </td>
  </tr>
);

export default SkeletonRow;
