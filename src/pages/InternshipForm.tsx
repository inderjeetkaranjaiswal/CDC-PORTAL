import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import { Save, ArrowLeft, Upload, Info } from 'lucide-react';

export default function InternshipForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentDetails: {
      name: '',
      rollNumber: '',
      branch: '',
      year: '',
      section: '',
      attendancePercentage: '',
    },
    internshipDetails: {
      companyName: '',
      website: '',
      obtainedThrough: '',
      fromDate: '',
      toDate: '',
      totalDuration: 0,
      mode: 'Offline',
      location: '',
      stipend: '',
      ppo: 'No',
      ctc: '',
    },
    spocDetails: {
      name: '',
      designation: '',
      email: '',
      phone: '',
    },
  });

  const [files, setFiles] = useState<{ [key: string]: File | File[] | null }>({
    offerLetter: null,
    joiningLetter: null,
    internshipProof: null,
  });

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Auto calculate duration if dates change
    if (field === 'fromDate' || field === 'toDate') {
      const fromVal = field === 'fromDate' ? value : formData.internshipDetails.fromDate;
      const toVal = field === 'toDate' ? value : formData.internshipDetails.toDate;
      
      if (fromVal && toVal) {
        const from = new Date(fromVal);
        const to = new Date(toVal);
        if (to > from) {
          const diffTime = Math.abs(to.getTime() - from.getTime());
          const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
          setFormData((prev: any) => ({
            ...prev,
            internshipDetails: {
              ...prev.internshipDetails,
              totalDuration: diffMonths,
            },
          }));
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files) {
      if (field === 'internshipProof') {
        setFiles((prev) => ({ ...prev, [field]: Array.from(e.target.files!) }));
      } else {
        setFiles((prev) => ({ ...prev, [field]: e.target.files![0] }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      
      // Ensure all numbers are correctly typed
      const submissionData = {
        ...formData,
        studentDetails: {
          ...formData.studentDetails,
          attendancePercentage: Number(formData.studentDetails.attendancePercentage)
        },
        internshipDetails: {
          ...formData.internshipDetails,
          totalDuration: Number(formData.internshipDetails.totalDuration)
        }
      };

      data.append('data', JSON.stringify(submissionData));
      
      if (files.offerLetter) data.append('offerLetter', files.offerLetter as File);
      if (files.joiningLetter) data.append('joiningLetter', files.joiningLetter as File);
      if (files.internshipProof) {
        (files.internshipProof as File[]).forEach((file) => {
          data.append('internshipProof', file);
        });
      }

      await axios.post('/api/internships/submit', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      navigate('/student');
    } catch (err: any) {
      console.error('Error submitting form:', err);
      alert(err.response?.data?.message || 'Failed to submit application. Please check all fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <button
        onClick={() => navigate('/student')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 font-medium"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 bg-slate-900 text-white">
          <h2 className="text-2xl font-bold">Internship Application Form</h2>
          <p className="text-slate-400 text-sm mt-1">Provide accurate details for CDC review and eligibility check.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          {/* Section A: Student Details */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-7 h-7 bg-[#78be21] rounded-full flex items-center justify-center text-xs text-white">A</span>
              Student Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                  value={formData.studentDetails.name}
                  onChange={(e) => handleInputChange('studentDetails', 'name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Roll Number</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                  value={formData.studentDetails.rollNumber}
                  onChange={(e) => handleInputChange('studentDetails', 'rollNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Branch</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                  value={formData.studentDetails.branch}
                  onChange={(e) => handleInputChange('studentDetails', 'branch', e.target.value)}
                >
                  <option value="">Select Branch</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="ME">ME</option>
                  <option value="CE">CE</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year</label>
                  <select
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                    value={formData.studentDetails.year}
                    onChange={(e) => handleInputChange('studentDetails', 'year', e.target.value)}
                  >
                    <option value="">Year</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Section</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                    value={formData.studentDetails.section}
                    onChange={(e) => handleInputChange('studentDetails', 'section', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Attendance Percentage</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                    value={formData.studentDetails.attendancePercentage}
                    onChange={(e) => handleInputChange('studentDetails', 'attendancePercentage', e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                </div>
                {Number(formData.studentDetails.attendancePercentage) < 75 && formData.studentDetails.attendancePercentage !== '' && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
                    <Info size={10} /> Attendance below 75% will result in "Not Eligible" status.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Section B: Internship Details */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-7 h-7 bg-[#78be21] rounded-full flex items-center justify-center text-xs text-white">B</span>
              Internship Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                  value={formData.internshipDetails.companyName}
                  onChange={(e) => handleInputChange('internshipDetails', 'companyName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Website</label>
                <input
                  type="url"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                  value={formData.internshipDetails.website}
                  onChange={(e) => handleInputChange('internshipDetails', 'website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Obtained Through</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                  value={formData.internshipDetails.obtainedThrough}
                  onChange={(e) => handleInputChange('internshipDetails', 'obtainedThrough', e.target.value)}
                >
                  <option value="">Select Option</option>
                  <option value="CDC Portal">CDC Portal</option>
                  <option value="Direct Application">Direct Application</option>
                  <option value="Referral">Referral</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">From Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                  value={formData.internshipDetails.fromDate}
                  onChange={(e) => handleInputChange('internshipDetails', 'fromDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">To Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                  value={formData.internshipDetails.toDate}
                  onChange={(e) => handleInputChange('internshipDetails', 'toDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Duration (Months)</label>
                <input
                  type="number"
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl outline-none text-slate-500 font-bold"
                  value={formData.internshipDetails.totalDuration}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mode</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                  value={formData.internshipDetails.mode}
                  onChange={(e) => handleInputChange('internshipDetails', 'mode', e.target.value)}
                >
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location & Address</label>
                <textarea
                  required
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                  value={formData.internshipDetails.location}
                  onChange={(e) => handleInputChange('internshipDetails', 'location', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stipend (per month)</label>
                <input
                  type="text"
                  placeholder="e.g. 15000 or Unpaid"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                  value={formData.internshipDetails.stipend}
                  onChange={(e) => handleInputChange('internshipDetails', 'stipend', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">PPO Offered?</label>
                  <select
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                    value={formData.internshipDetails.ppo}
                    onChange={(e) => handleInputChange('internshipDetails', 'ppo', e.target.value)}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                {formData.internshipDetails.ppo === 'Yes' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">CTC (LPA)</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                      value={formData.internshipDetails.ctc}
                      onChange={(e) => handleInputChange('internshipDetails', 'ctc', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section C: SPOC Details */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-7 h-7 bg-[#78be21] rounded-full flex items-center justify-center text-xs text-white">C</span>
              SPOC Details (Company Point of Contact)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">SPOC Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                  value={formData.spocDetails.name}
                  onChange={(e) => handleInputChange('spocDetails', 'name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Designation</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                  value={formData.spocDetails.designation}
                  onChange={(e) => handleInputChange('spocDetails', 'designation', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                  value={formData.spocDetails.email}
                  onChange={(e) => handleInputChange('spocDetails', 'email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#78be21]/20 focus:border-[#78be21] outline-none transition-all"
                  value={formData.spocDetails.phone}
                  onChange={(e) => handleInputChange('spocDetails', 'phone', e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Section D: Attachments */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-7 h-7 bg-[#78be21] rounded-full flex items-center justify-center text-xs text-white">D</span>
              Attachments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Offer Letter (PDF)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={(e) => handleFileChange(e, 'offerLetter')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 group-hover:border-[#78be21] group-hover:bg-[#78be21]/5 transition-all">
                    <Upload className="text-slate-400 group-hover:text-[#78be21]" size={24} />
                    <span className="text-xs font-bold text-slate-500 group-hover:text-[#78be21] text-center">
                      {files.offerLetter ? (files.offerLetter as File).name : 'Click to upload PDF'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Joining Letter (PDF)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={(e) => handleFileChange(e, 'joiningLetter')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 group-hover:border-[#78be21] group-hover:bg-[#78be21]/5 transition-all">
                    <Upload className="text-slate-400 group-hover:text-[#78be21]" size={24} />
                    <span className="text-xs font-bold text-slate-500 group-hover:text-[#78be21] text-center">
                      {files.joiningLetter ? (files.joiningLetter as File).name : 'Click to upload PDF'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Internship Proof (Multiple Files - PDF/JPG/PNG)</label>
                <div className="relative group">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'internshipProof')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 group-hover:border-[#78be21] group-hover:bg-[#78be21]/5 transition-all">
                    <Upload className="text-slate-400 group-hover:text-[#78be21]" size={32} />
                    <span className="text-sm font-bold text-slate-500 group-hover:text-[#78be21] text-center">
                      {files.internshipProof ? `${(files.internshipProof as File[]).length} files selected` : 'Click to upload multiple proof documents'}
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Allowed: PDF, JPG, PNG</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-8 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3 bg-[#78be21] hover:bg-[#68a61d] text-white font-bold rounded-xl shadow-lg shadow-[#78be21]/20 transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-70"
            >
              <Save size={20} />
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

}
