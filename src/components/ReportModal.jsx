import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, Send, CheckCircle, Info } from 'lucide-react';
import { trustSafetyService } from '../services/trustSafetyService';
import { useApp } from '../context/AppContext';

export const ReportModal = ({ isOpen, onClose, targetUser }) => {
  const { showToast } = useApp();
  const [category, setCategory] = useState('Unprofessional Conduct');
  const [reason, setReason] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !targetUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('Please provide a specific description of the issue', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await trustSafetyService.submitReport({
        targetUserId: targetUser.id,
        targetUserName: targetUser.name,
        category,
        reason: reason.trim(),
        evidenceNotes: evidenceNotes.trim()
      });
      setIsSuccess(true);
      showToast('Report logged securely for moderation review', 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to submit report', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setReason('');
    setEvidenceNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-rose-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Trust & Safety Report</h3>
              <p className="text-xs text-slate-500">Target: {targetUser.name}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">Report Flagged for Campus Review</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Our community moderation team has received your report. The user's account is marked as <strong>Flagged for Review</strong> while evidence is inspected. If a session dispute was filed, escrow credits remain paused.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Category */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Issue Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-teal-500 outline-none"
              >
                <option value="Unprofessional Conduct">Unprofessional Conduct</option>
                <option value="Session No-Show or Left Early">Session No-Show or Left Early</option>
                <option value="Skill Misrepresentation">Skill / Evidence Misrepresentation</option>
                <option value="Inappropriate Communication">Inappropriate Communication / Harassment</option>
                <option value="Other Policy Violation">Other Campus Policy Violation</option>
              </select>
            </div>

            {/* Detailed Reason */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Description of Issue *</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Explain what occurred during the session or conversation..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none resize-none"
                required
              />
            </div>

            {/* Evidence Link / Notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Evidence / Message Links (Optional)</label>
              <input
                type="text"
                value={evidenceNotes}
                onChange={e => setEvidenceNotes(e.target.value)}
                placeholder="Paste relevant links or timestamp notes..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-teal-500 outline-none"
              />
            </div>

            {/* Process note */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                To protect student integrity, SkillSwap applies a fair review process with right to appeal. False or malicious reports are strictly against campus guidelines.
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
