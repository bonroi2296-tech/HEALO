'use client';

/**
 * Bulk Import Page
 * CSV/Excel 파일 업로드 및 일괄 등록
 */

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export default function ImportPage() {
  const [dataType, setDataType] = useState('hospitals'); // 'hospitals' or 'treatments'
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: 업로드, 2: 미리보기, 3: 검증, 4: 완료

  // 파일 드롭 핸들러
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFile(file);
    parseFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json'],
    },
    maxFiles: 1,
  });

  // 파일 파싱
  const parseFile = (file) => {
    const fileType = file.name.split('.').pop().toLowerCase();

    if (fileType === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setParsedData(results.data);
          setStep(2);
        },
        error: (error) => {
          alert('CSV 파싱 실패: ' + error.message);
        },
      });
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          setParsedData(jsonData);
          setStep(2);
        } catch (error) {
          alert('Excel 파싱 실패: ' + error.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileType === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          // JSON은 배열이어야 함
          if (!Array.isArray(jsonData)) {
            alert('JSON 파일은 배열 형식이어야 합니다. 예: [{"name": "병원1"}, {"name": "병원2"}]');
            return;
          }
          setParsedData(jsonData);
          setStep(2);
        } catch (error) {
          alert('JSON 파싱 실패: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  // 검증 실행
  const handleValidate = async () => {
    setLoading(true);
    try {
      const endpoint = `/api/admin/import/${dataType}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsedData, mode: 'validate' }),
      });

      const result = await response.json();
      if (result.ok) {
        setValidationResult(result);
        setStep(3);
      } else {
        alert('검증 실패: ' + (result.message || result.error));
      }
    } catch (error) {
      alert('검증 오류: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 실제 등록
  const handleImport = async () => {
    if (!confirm(`${validationResult.valid}개의 데이터를 등록하시겠습니까?`)) {
      return;
    }

    setLoading(true);
    try {
      const endpoint = `/api/admin/import/${dataType}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsedData, mode: 'import' }),
      });

      const result = await response.json();
      if (result.ok) {
        setImportResult(result.result);
        setStep(4);
      } else {
        alert('등록 실패: ' + (result.message || result.error));
      }
    } catch (error) {
      alert('등록 오류: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 초기화
  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setValidationResult(null);
    setImportResult(null);
    setStep(1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">대량 데이터 Import</h1>

      {/* 데이터 타입 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">데이터 타입</label>
        <div className="flex gap-4">
          <button
            onClick={() => setDataType('hospitals')}
            className={`px-6 py-2 rounded ${
              dataType === 'hospitals'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            병원 (Hospitals)
          </button>
          <button
            onClick={() => setDataType('treatments')}
            className={`px-6 py-2 rounded ${
              dataType === 'treatments'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            시술 (Treatments)
          </button>
        </div>
      </div>

      {/* Step 1: 파일 업로드 */}
      {step === 1 && (
        <div>
          {/* 템플릿 다운로드 */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="font-medium mb-2">📥 템플릿 다운로드</p>
            <div className="flex gap-4">
              <a
                href={`/templates/${dataType === 'hospitals' ? 'hospital' : 'treatment'}-import-template.csv`}
                download
                className="text-blue-600 underline hover:text-blue-800"
              >
                📊 CSV 템플릿
              </a>
              <a
                href={`/templates/${dataType === 'hospitals' ? 'hospital' : 'treatment'}-import-template.json`}
                download
                className="text-blue-600 underline hover:text-blue-800"
              >
                📋 JSON 템플릿
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 CSV는 Excel로 편집하기 쉽고, JSON은 복잡한 데이터 구조에 적합합니다.
            </p>
          </div>

          {/* 파일 업로드 영역 */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-gray-600">
              {isDragActive ? (
                <p className="text-lg">파일을 여기에 놓으세요...</p>
              ) : (
                <>
                  <p className="text-lg mb-2">CSV, Excel 또는 JSON 파일을 드래그하거나 클릭하세요</p>
                  <p className="text-sm text-gray-500">지원 형식: .csv, .xlsx, .xls, .json</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: 미리보기 */}
      {step === 2 && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">데이터 미리보기</h2>
            <button onClick={handleReset} className="px-4 py-2 bg-gray-200 rounded">
              다시 선택
            </button>
          </div>

          <p className="mb-4 text-gray-600">
            총 {parsedData.length}개 행 | 파일: {file?.name}
          </p>

          {/* 테이블 미리보기 (최대 10행) */}
          <div className="overflow-x-auto mb-6 border rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {parsedData[0] &&
                    Object.keys(parsedData[0]).map((key) => (
                      <th
                        key={key}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parsedData.slice(0, 10).map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((value, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate">
                        {String(value || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {parsedData.length > 10 && (
            <p className="text-sm text-gray-500 mb-4">
              * 미리보기는 최대 10행만 표시됩니다.
            </p>
          )}

          <button
            onClick={handleValidate}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '검증 중...' : '데이터 검증하기'}
          </button>
        </div>
      )}

      {/* Step 3: 검증 결과 */}
      {step === 3 && validationResult && (
        <div>
          <h2 className="text-xl font-bold mb-4">검증 결과</h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 border rounded">
              <p className="text-sm text-gray-600">전체</p>
              <p className="text-2xl font-bold">{validationResult.total}</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-600">성공</p>
              <p className="text-2xl font-bold text-green-700">{validationResult.valid}</p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-600">실패</p>
              <p className="text-2xl font-bold text-red-700">{validationResult.invalid}</p>
            </div>
          </div>

          {/* 오류 목록 */}
          {validationResult.errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded max-h-96 overflow-y-auto">
              <p className="font-medium mb-2 text-red-700">오류 목록</p>
              {validationResult.errors.map((error, idx) => (
                <div key={idx} className="mb-2 p-2 bg-white border rounded text-sm">
                  <p className="font-medium">행 {error.row}:</p>
                  <ul className="list-disc list-inside ml-2 text-red-600">
                    {error.errors.map((msg, msgIdx) => (
                      <li key={msgIdx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300"
            >
              취소
            </button>
            <button
              onClick={handleImport}
              disabled={loading || validationResult.valid === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? '등록 중...' : `${validationResult.valid}개 데이터 등록하기`}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: 완료 */}
      {step === 4 && importResult && (
        <div>
          <h2 className="text-xl font-bold mb-4">등록 완료</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-600">성공</p>
              <p className="text-2xl font-bold text-green-700">{importResult.success}</p>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-600">실패</p>
              <p className="text-2xl font-bold text-red-700">{importResult.failed}</p>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded max-h-96 overflow-y-auto">
              <p className="font-medium mb-2 text-red-700">실패한 행</p>
              {importResult.errors.map((error, idx) => (
                <div key={idx} className="mb-2 p-2 bg-white border rounded text-sm">
                  <p className="font-medium">행 {error.row}:</p>
                  <ul className="list-disc list-inside ml-2 text-red-600">
                    {error.errors.map((msg, msgIdx) => (
                      <li key={msgIdx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleReset}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
          >
            새로운 Import 시작
          </button>
        </div>
      )}
    </div>
  );
}
