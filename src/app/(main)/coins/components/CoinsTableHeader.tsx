const CoinsTableHeader = () => {
  return (
    <thead className="border-b bg-gray-900 font-medium text-gray-300">
      <tr>
        <th className="px-8 py-3">نام رمزارز</th>
        <th className="px-8 py-3">اخرین قیمت جهانی</th>
        <th className="px-8 py-3">تغییرات 24h</th>
        <th className="px-8 py-3">ارزش معاملات 24h</th>
        <th className="px-8 py-3">چارت تغیرات 7D</th>
      </tr>
    </thead>
  );
};

export default CoinsTableHeader;
