// src/AdminPage.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export const AdminPage = ({ setView }) => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // 데이터 가져오는 함수
  const fetchInquiries = async () => {
    setLoading(true);
    // created_at 기준 내림차순 (최신순) 정렬
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error:', error);
    else setInquiries(data || []);
    setLoading(false);
  };

  useEffect(() => {
    // 들어올 때 비밀번호 물어보기 (간단 보안)
    const pw = prompt("Enter Admin Password:");
    if (pw !== "1234") { // 비밀번호는 1234
        alert("Wrong Password!");
        setView('home');
        return;
    }
    fetchInquiries();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setView('home')} className="flex items-center gap-2 text-gray-600 hover:text-teal-600 font-bold">
            <ArrowLeft size={20}/> Back to Home
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard 💼</h1>
          <button onClick={fetchInquiries} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 shadow-sm">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""}/>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Language</th>
                  <th className="px-6 py-4">Message</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((item) => (
                  <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{item.first_name} {item.last_name}</td>
                    <td className="px-6 py-4">{item.email}</td>
                    <td className="px-6 py-4">{item.spoken_language}</td>
                    <td className="px-6 py-4 max-w-xs truncate" title={item.message}>{item.message}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {inquiries.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">No inquiries yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};