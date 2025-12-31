import { useState } from 'react';
import { ArrowLeft, Bug, ExternalLink, CheckCircle, AlertCircle, Monitor, Send } from 'lucide-react';
import { HOLIDAYS, HolidayId } from '../lib/holidays';
import { submitBug, BugReportFormData } from '../lib/bugService';
import { useClientInfo } from '../hooks/useClientInfo';

interface FeedbackProps {
  storeNumber: string;
  holidayId: HolidayId;
  onLogout: () => void;
  onSwitchHoliday: () => void;
  onBack: () => void;
}

type Severity = 'minor' | 'major' | 'critical' | 'service_unusable';

const SEVERITY_OPTIONS: { value: Severity; label: string; description: string }[] = [
  { value: 'minor', label: 'Minor', description: 'Small issue, workaround available' },
  { value: 'major', label: 'Major', description: 'Significant issue affecting usage' },
  { value: 'critical', label: 'Critical', description: 'Major functionality broken' },
  { value: 'service_unusable', label: 'Service Unusable', description: 'App completely non-functional' },
];

export default function Feedback({
  storeNumber,
  holidayId,
  onBack,
}: FeedbackProps) {
  const holiday = HOLIDAYS[holidayId];
  const { theme } = holiday;
  const clientInfo = useClientInfo();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('major');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedBugId, setSubmittedBugId] = useState<string | null>(null);

  const gradientClass = `${theme.gradientFrom} ${theme.gradientVia} ${theme.gradientTo}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim() || !description.trim()) {
      setSubmitError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData: BugReportFormData = {
        name: name.trim(),
        description: description.trim(),
        severity,
      };

      const bugId = await submitBug(formData, clientInfo, 'Liability Tracker');
      setSubmittedBugId(bugId);
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit bug report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setDescription('');
    setSeverity('major');
    setSubmitSuccess(false);
    setSubmittedBugId(null);
    setSubmitError(null);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${gradientClass}`}>
      {/* Header */}
      <header className="p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold drop-shadow-md flex items-center">
              <span className="mr-2 text-3xl"><Bug size={28} /></span> Feedback
            </h1>
            <p className="text-white/80 text-xs font-medium opacity-90 pl-1">
              Store #{storeNumber} - {holiday.shortName}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-8 max-w-lg mx-auto space-y-4">
        {/* Bug Report Card */}
        <div className="bg-white/95 rounded-2xl shadow-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-red-100 rounded-xl">
              <Bug size={22} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Report a Bug</h2>
              <p className="text-slate-500 text-xs">Help us improve by reporting issues</p>
            </div>
          </div>

          {submitSuccess ? (
            /* Success State */
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Bug Report Submitted!</h3>
              <p className="text-slate-600 text-sm mb-4">
                Thank you for your feedback. We'll look into this issue.
              </p>
              {submittedBugId && (
                <p className="text-slate-500 text-xs mb-4">
                  Reference ID: <span className="font-mono font-medium">{submittedBugId}</span>
                </p>
              )}
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            /* Bug Report Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  required
                />
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the bug in detail. What were you trying to do? What happened instead?"
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                  required
                />
              </div>

              {/* Severity Field */}
              <div>
                <label htmlFor="severity" className="block text-sm font-medium text-slate-700 mb-1">
                  Severity
                </label>
                <select
                  id="severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                >
                  {SEVERITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white/50 border-t-white rounded-full" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Bug Report
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* System Info Card */}
        <div className="bg-white/95 rounded-2xl shadow-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-slate-100 rounded-xl">
              <Monitor size={18} className="text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Auto-Detected System Info</h3>
              <p className="text-slate-500 text-xs">Included with your bug report</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 rounded-lg p-2">
              <span className="text-slate-500 block">Browser</span>
              <span className="font-medium text-slate-700">{clientInfo.browser} {clientInfo.browserVersion}</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <span className="text-slate-500 block">OS</span>
              <span className="font-medium text-slate-700">{clientInfo.os} {clientInfo.osVersion}</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <span className="text-slate-500 block">Device</span>
              <span className="font-medium text-slate-700">{clientInfo.device}</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <span className="text-slate-500 block">Screen</span>
              <span className="font-medium text-slate-700">{clientInfo.screenResolution}</span>
            </div>
          </div>
        </div>

        {/* Walmart Dashboard Info Card */}
        <div className="bg-white/95 rounded-2xl shadow-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <ExternalLink size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Request New Features</h2>
              <p className="text-slate-500 text-xs">Have an idea to improve the app?</p>
            </div>
          </div>
          
          <p className="text-slate-600 text-sm mb-4">
            Visit the <strong>Walmart Dashboard</strong> to submit feature requests, view upcoming updates, 
            and track the status of your submissions. The dashboard is the central hub for all Walmart 
            store tools and apps.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
            <h4 className="font-semibold text-blue-800 text-sm mb-2">Dashboard Features:</h4>
            <ul className="text-blue-700 text-xs space-y-1">
              <li>Submit and track feature requests</li>
              <li>View release notes and updates</li>
              <li>Access all Walmart store tools</li>
              <li>Get announcements and news</li>
            </ul>
          </div>

          <a
            href="https://walmart.firefetch.org"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <ExternalLink size={18} />
            Open Walmart Dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
