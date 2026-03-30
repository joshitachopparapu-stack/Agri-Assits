import React, { useState } from 'react';
import { ArrowLeft, Plus, MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '../components/i18n/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const typeIcons = { pest_outbreak: '🐛', crop_disease: '🌿', flood_damage: '🌊', drought: '☀️', other: '📋' };
const severityColors = { low: 'bg-blue-100 text-blue-700', medium: 'bg-amber-100 text-amber-700', high: 'bg-orange-100 text-orange-700', critical: 'bg-red-100 text-red-700' };

export default function Community() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ report_type: '', description: '', location: '', severity: 'medium' });

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['communityReports'],
    queryFn: () => base44.entities.CommunityReport.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CommunityReport.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityReports'] });
      setOpen(false);
      setForm({ report_type: '', description: '', location: '', severity: 'medium' });
    },
  });

  const reportTypes = [
    { value: 'pest_outbreak', label: t('pestOutbreak') },
    { value: 'crop_disease', label: t('cropDisease') },
    { value: 'flood_damage', label: t('floodDamage') },
    { value: 'drought', label: t('droughtCondition') },
    { value: 'other', label: t('other') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-rose-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/Home"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="font-bold">{t('featureCommunity')}</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary" className="rounded-lg h-8 text-xs">
              <Plus className="w-3 h-3 mr-1" />{t('reportIssue')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader><DialogTitle>{t('reportIssue')}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.report_type} onValueChange={v => setForm({...form, report_type: v})}>
                <SelectTrigger><SelectValue placeholder={t('reportIssue')} /></SelectTrigger>
                <SelectContent>
                  {reportTypes.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea placeholder={t('reportIssue')} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <Input placeholder={t('location')} value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
              <Select value={form.severity} onValueChange={v => setForm({...form, severity: v})}>
                <SelectTrigger><SelectValue placeholder={t('severityLevel')} /></SelectTrigger>
                <SelectContent>
                  {['low','medium','high','critical'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.report_type || !form.description} className="w-full bg-rose-600 hover:bg-rose-700">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('submit')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        <h3 className="font-bold text-sm text-gray-900 mb-3">{t('regionalAlerts')}</h3>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{t('noData')}</div>
        ) : (
          <div className="space-y-3">
            {reports.map(report => (
              <div key={report.id} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{typeIcons[report.report_type] || '📋'}</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {reportTypes.find(r => r.value === report.report_type)?.label || report.report_type}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <MapPin className="w-3 h-3" />{report.location}
                      </div>
                    </div>
                  </div>
                  <Badge className={`text-xs ${severityColors[report.severity] || 'bg-gray-100'}`}>
                    {report.severity}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">{report.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
