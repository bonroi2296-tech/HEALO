import React from 'react';
import { RefreshCw, Paperclip } from 'lucide-react';
import { formatDate } from "../../lib/i18n/format";

export const InquiryManager = ({ inquiries, fetchInquiries, handleStatusChange, handleFileClick }) => {
  const InquiryRow = ({ item }) => (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-6 py-4 text-gray-500 text-sm">
        {formatDate(item.created_at, "en")}
      </td>
      <td className="px-6 py-4">
        <div className="font-bold">{item.first_name} {item.last_name}</div>
        <div className="text-xs text-teal-600">{item.email}</div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        <div>{item.treatment_type}</div>
        <div className="text-xs text-gray-400">{item.contact_method}</div>
      </td>
      <td className="px-6 py-4">
        <div className="p-2 bg-gray-50 rounded text-xs text-gray-700 max-h-20 overflow-y-auto">{item.message}</div>
      </td>
      <td className="px-6 py-4 text-center">
        {item.attachment ? <button onClick={()=>handleFileClick(item.attachment)}><Paperclip size={16}/></button> : '-'}
      </td>
      <td className="px-6 py-4">
        <select value={item.status||'대기중'} onChange={e=>handleStatusChange(item.id, e.target.value)} className="border rounded p-1 text-xs">
          <option>대기중</option>
          <option>진행중</option>
          <option>완료</option>
        </select>
      </td>
    </tr>
  );

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">고객 문의 현황</h1>
        <button onClick={fetchInquiries}><RefreshCw/></button>
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">날짜</th>
              <th className="px-6 py-3">고객 정보</th>
              <th className="px-6 py-3">관심 분야</th>
              <th className="px-6 py-3">메시지</th>
              <th className="px-6 py-3 text-center">첨부</th>
              <th className="px-6 py-3">상태</th>
            </tr>
          </thead>
          <tbody>{inquiries.map(i => <InquiryRow key={i.id} item={i}/>)}</tbody>
        </table>
      </div>
    </div>
  );
};
