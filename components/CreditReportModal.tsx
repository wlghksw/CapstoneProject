
import React, { useState } from 'react';

interface CreditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'general' | 'liberal';

interface TableHeaderProps {
  children: React.ReactNode;
}

const TableHeader: React.FC<TableHeaderProps> = ({ children }) => (
  <th className="px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
    {children}
  </th>
);

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  rowSpan?: number;
  colSpan?: number;
}

const TableCell: React.FC<TableCellProps> = ({ children, className = "", rowSpan, colSpan }) => (
  <td className={`px-3 py-3 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 ${className}`} rowSpan={rowSpan} colSpan={colSpan}>
    {children}
  </td>
);

const CreditReportModal: React.FC<CreditReportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  if (!isOpen) return null;

  const renderGeneralTable = () => (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
        <table className="w-full border-collapse">
            <thead>
                <tr>
                    <TableHeader>이수구분</TableHeader>
                    <TableHeader>세부구분</TableHeader>
                    <TableHeader>기준</TableHeader>
                    <TableHeader>취득</TableHeader>
                    <TableHeader>부족</TableHeader>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {/* Graduation */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell rowSpan={2} className="bg-gray-50/30 dark:bg-gray-800/50 font-bold text-center border-r border-gray-100 dark:border-gray-700">졸업</TableCell>
                    <TableCell className="font-medium">졸업이수학점</TableCell>
                    <TableCell className="text-center text-gray-500">120</TableCell>
                    <TableCell className="text-center font-bold text-blue-600 dark:text-blue-400">120</TableCell>
                    <TableCell className="text-center text-gray-300">0</TableCell>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="font-medium">평점평균</TableCell>
                    <TableCell className="text-center text-gray-500">1.5</TableCell>
                    <TableCell className="text-center font-bold text-gray-800 dark:text-gray-200">3.8</TableCell>
                    <TableCell className="text-center text-gray-300">0</TableCell>
                </tr>
                
                {/* Liberal Arts */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors border-t border-gray-200 dark:border-gray-700">
                    <TableCell rowSpan={4} className="bg-gray-50/30 dark:bg-gray-800/50 font-bold text-center border-r border-gray-100 dark:border-gray-700">교양</TableCell>
                    <TableCell className="font-medium">교양 합계</TableCell>
                    <TableCell className="text-center text-gray-500">38</TableCell>
                    <TableCell className="text-center font-bold text-green-600 dark:text-green-400">47</TableCell>
                    <TableCell className="text-center text-gray-300">0</TableCell>
                </tr>
                {['교양필수', '교양선택', '기타교양'].map((item) => (
                    <tr key={item} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                        <TableCell className="text-gray-500">{item}</TableCell>
                        <TableCell className="text-center text-gray-300">-</TableCell>
                        <TableCell className="text-center text-gray-300">-</TableCell>
                        <TableCell className="text-center text-gray-300">0</TableCell>
                    </tr>
                ))}

                {/* Major */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors border-t border-gray-200 dark:border-gray-700">
                    <TableCell rowSpan={6} className="bg-gray-50/30 dark:bg-gray-800/50 font-bold text-center border-r border-gray-100 dark:border-gray-700">주전공</TableCell>
                    <TableCell className="font-medium">전공 합계</TableCell>
                    <TableCell className="text-center text-gray-500">54</TableCell>
                    <TableCell className="text-center font-bold text-green-600 dark:text-green-400">73</TableCell>
                    <TableCell className="text-center text-gray-300">0</TableCell>
                </tr>
                {[
                    { label: '기초교과군', req: 6, get: 12 },
                    { label: '핵심교과군', req: 6, get: 17 },
                    { label: '심화교과군', req: 6, get: 24 },
                    { label: '응용교과군', req: 6, get: 11 },
                    { label: '타전공인정', req: 0, get: 9 },
                ].map((item) => (
                    <tr key={item.label} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                        <TableCell className="text-gray-500">{item.label}</TableCell>
                        <TableCell className="text-center text-gray-500">{item.req}</TableCell>
                        <TableCell className="text-center font-medium text-gray-700 dark:text-gray-300">{item.get}</TableCell>
                        <TableCell className="text-center text-gray-300">0</TableCell>
                    </tr>
                ))}

                 {/* Other */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors border-t border-gray-200 dark:border-gray-700">
                    <TableCell rowSpan={2} className="bg-gray-50/30 dark:bg-gray-800/50 font-bold text-center border-r border-gray-100 dark:border-gray-700">기타</TableCell>
                    <TableCell className="text-gray-500">교직</TableCell>
                    <TableCell className="text-center text-gray-300">0</TableCell>
                    <TableCell className="text-center text-gray-300">0</TableCell>
                    <TableCell className="text-center text-gray-300">0</TableCell>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="text-gray-500">일반선택</TableCell>
                    <TableCell className="text-center text-gray-300">0</TableCell>
                    <TableCell className="text-center text-gray-300">0</TableCell>
                    <TableCell className="text-center text-gray-300">0</TableCell>
                </tr>
            </tbody>
        </table>
    </div>
  );

  const renderLiberalTable = () => (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
        <table className="w-full border-collapse">
            <thead>
                <tr className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-2 py-3 w-1/6 border-r border-gray-200 dark:border-gray-700" rowSpan={2}>영역</th>
                    <th className="px-3 py-3 text-left w-1/4 border-r border-gray-200 dark:border-gray-700" rowSpan={2}>세부 영역</th>
                    <th className="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-center w-1/6" colSpan={2}>기준(최소)</th>
                    <th className="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-center w-1/6" colSpan={2}>취득</th>
                    <th className="px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-center w-1/6" colSpan={2}>부족</th>
                </tr>
                <tr className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="py-2 border-r border-gray-100 dark:border-gray-800 text-center">과목</th>
                    <th className="py-2 text-center">학점</th>
                    <th className="py-2 border-r border-gray-100 dark:border-gray-800 text-center">과목</th>
                    <th className="py-2 text-center">학점</th>
                    <th className="py-2 border-r border-gray-100 dark:border-gray-800 text-center">과목</th>
                    <th className="py-2 text-center">학점</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {[
                    { group: '백석', items: [
                        { name: '채플과섬김', reqC: 8, reqS: 4, getC: 8, getS: 4 },
                        { name: '사랑의실천', reqC: 0, reqS: 4, getC: 4, getS: 4 }
                    ]},
                    { group: '기초', items: [
                        { name: '글로벌역량', reqC: 0, reqS: 6, getC: 3, getS: 6 },
                        { name: '정보기술', reqC: 0, reqS: 2, getC: 1, getS: 2 },
                        { name: '맞춤형글쓰기', reqC: 0, reqS: 2, getC: 1, getS: 2 },
                        { name: '과학과 토론', reqC: 0, reqS: 2, getC: 1, getS: 2 }
                    ]},
                    { group: '심화', items: [
                        { name: '균형-인간문화 등', reqC: 0, reqS: 6, getC: 7, getS: 14 },
                        { name: '균형(자)-자연과학', reqC: 0, reqS: 0, getC: 0, getS: 0 },
                        { name: '균형-타계열', reqC: 0, reqS: 0, getC: 0, getS: 0 },
                        { name: '사고와 문제해결', reqC: 0, reqS: 2, getC: 2, getS: 4 }
                    ]},
                     { group: '소양', items: [
                        { name: '대학생활과 진로', reqC: 1, reqS: 0, getC: 1, getS: 0 },
                        { name: '취·창업과 진로', reqC: 1, reqS: 1, getC: 1, getS: 1 },
                        { name: '커리어개발', reqC: 1, reqS: 0, getC: 1, getS: 0 },
                        { name: '프론티어십', reqC: 1, reqS: 0, getC: 1, getS: 0 },
                        { name: '대인관계/봉사', reqC: 0, reqS: 4, getC: 3, getS: 4 },
                        { name: '기독교 소양', reqC: 0, reqS: 4, getC: 4, getS: 4 }
                    ]}
                ].map((section) => (
                    <React.Fragment key={section.group}>
                         <tr className="group border-t border-gray-200 dark:border-gray-700">
                            <TableCell 
                                className="font-bold text-center bg-gray-50/30 dark:bg-gray-800/50 border-r border-gray-100 dark:border-gray-700 align-middle" 
                                rowSpan={section.items.length}
                            >
                                {section.group}
                            </TableCell>
                            {/* First item row */}
                            <TableCell className="font-medium text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-800">{section.items[0].name}</TableCell>
                            <TableCell className="text-center text-gray-400 border-r border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-800/20">{section.items[0].reqC}</TableCell>
                            <TableCell className="text-center text-gray-500 bg-gray-50/20 dark:bg-gray-800/20">{section.items[0].reqS}</TableCell>
                            <TableCell className="text-center text-gray-400 border-r border-gray-100 dark:border-gray-800">{section.items[0].getC}</TableCell>
                            <TableCell className="text-center font-semibold text-green-600 dark:text-green-400">{section.items[0].getS}</TableCell>
                            <TableCell className="text-center text-gray-300 border-r border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-800/20">0</TableCell>
                            <TableCell className="text-center text-gray-300 bg-gray-50/20 dark:bg-gray-800/20">0</TableCell>
                         </tr>
                         {/* Remaining items */}
                         {section.items.slice(1).map((item) => (
                             <tr key={item.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                <TableCell className="text-gray-600 dark:text-gray-400 border-r border-gray-100 dark:border-gray-800">{item.name}</TableCell>
                                <TableCell className="text-center text-gray-400 border-r border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-800/20">{item.reqC}</TableCell>
                                <TableCell className="text-center text-gray-500 bg-gray-50/20 dark:bg-gray-800/20">{item.reqS}</TableCell>
                                <TableCell className="text-center text-gray-400 border-r border-gray-100 dark:border-gray-800">{item.getC}</TableCell>
                                <TableCell className="text-center font-semibold text-green-600 dark:text-green-400">{item.getS}</TableCell>
                                <TableCell className="text-center text-gray-300 border-r border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-800/20">0</TableCell>
                                <TableCell className="text-center text-gray-300 bg-gray-50/20 dark:bg-gray-800/20">0</TableCell>
                             </tr>
                         ))}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">이수 학점 상세 리포트</h2>
          <button 
            onClick={onClose} 
            className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 px-6 pt-2">
            <button 
                className={`pb-3 px-4 text-sm font-bold transition-all relative mr-4 ${
                    activeTab === 'general' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
                onClick={() => setActiveTab('general')}
            >
                종합 이수 현황
                {activeTab === 'general' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"></span>}
            </button>
            <button 
                className={`pb-3 px-4 text-sm font-bold transition-all relative ${
                    activeTab === 'liberal' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
                onClick={() => setActiveTab('liberal')}
            >
                교양 영역 상세
                 {activeTab === 'liberal' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 dark:bg-green-400 rounded-t-full"></span>}
            </button>
        </div>
        
        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow bg-gray-50/30 dark:bg-gray-900/20">
            {activeTab === 'general' && (
                <div className="animate-fade-in space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-base text-gray-800 dark:text-gray-200 flex items-center">
                            <span className="w-1.5 h-5 bg-blue-500 rounded-full mr-2"></span>
                            졸업 및 전공 현황
                        </h3>
                        <span className="text-xs text-gray-500">단위: 학점</span>
                    </div>
                    {renderGeneralTable()}
                </div>
            )}

            {activeTab === 'liberal' && (
                <div className="animate-fade-in space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-base text-gray-800 dark:text-gray-200 flex items-center">
                            <span className="w-1.5 h-5 bg-green-500 rounded-full mr-2"></span>
                            교양 세부 이수 현황
                        </h3>
                        <span className="text-xs text-gray-500">단위: 과목수 / 학점</span>
                    </div>
                    {renderLiberalTable()}
                </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default CreditReportModal;
